import React, { useState, useEffect } from "react";
import axios from "axios";
import "../App.css";
import { downloadPaper } from "../utils/downloadPaper";

export default function Admin() {
  // ===== STATE =====
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [type, setType] = useState("theory");

  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");

  const [examiners, setExaminers] = useState([]);
  const [selectedExaminer, setSelectedExaminer] = useState("");

  const [selectedExaminers, setSelectedExaminers] = useState([]); // for checkbox UI
  const [selectedExaminerIds, setSelectedExaminerIds] = useState([]); // for assign API

  const [loading, setLoading] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [paper, setPaper] = useState(null);

  const [manualQuestions, setManualQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [marks, setMarks] = useState(5);

  // ===== AUTH CHECK =====
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      alert("Access Denied ❌");
      window.location = "/dashboard";
    }
  }, []);

  // ===== LOAD DATA =====
  const loadExams = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/exam/admin");
      setExams(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    axios.get("http://localhost:5000/api/auth/examiners")
      .then(res => setExaminers(res.data))
      .catch(err => console.log(err));
  }, []);

  // ===== CREATE EXAM =====
  const createExam = async () => {
  try {
    if (!title) return alert("Enter exam title ❌");

    await axios.post("http://localhost:5000/api/exam/create", {
      title,
      duration: "3hrs",
      questions: []
    });

    alert("Exam Created ✅");

    // 🔥 FORCE REFRESH
    const res = await axios.get("http://localhost:5000/api/exam");
    setExams(res.data);

    setTitle("");

  } catch (err) {
    console.log(err);
    alert("Error creating exam ❌");
  }
};

  // ===== AI QUESTIONS (OPTIONAL FEATURE) =====
  const generateAI = async () => {
    try {
      if (!subject || !topic) return alert("Enter subject & topic ❌");
      if (!selectedExam) return alert("Select exam ❌");

      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/ai/generate",
        { subject, topic, difficulty, type }
      );

  try {
    if (!subject || !topic) return alert("Enter subject & topic ❌");
    if (!selectedExam) return alert("Select exam ❌");

    setLoading(true);

    const res = await axios.post(
      "http://localhost:5000/api/ai/generate",
      { subject }
    );

    const paper = res.data;

    // ✅ SAVE DIRECTLY
    await axios.put(
      `http://localhost:5000/api/exam/save-generated-paper/${selectedExam}`,
      {
        paper,
        examinerId: selectedExaminer || null
      }
    );

    alert("✅ AI Paper Generated & Saved");

  } catch (err) {
    console.log(err);
    alert("AI Error ❌");
  } finally {
    setLoading(false);
  };

      alert("AI Questions Saved ✅");

    } catch {
      alert("AI Error ❌");
    } finally {
      setLoading(false);
    }
  };

  // ===== PREVIEW =====
  const previewQuestionsHandler = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/ai/preview",
        { subject }
      );
      setPreviewQuestions(res.data);
    } catch {
      alert("Preview failed ❌");
    }
  };

  // ===== GENERATE FULL PAPER (FIXED CORE) =====
  const generatePaper = async () => {
    try {
      if (!selectedExam || !selectedExaminer) {
        return alert("Select exam & examiner ❌");
      }

      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/admin/generate-paper",
        {
          examId: selectedExam,
          examinerId: selectedExaminer,
          subject: subject || "DSA",
          manualQuestions
        },
        {
          headers: { "x-auth-token": token }
        }
      );

      await fetchPaper(selectedExam);

      alert("✅ Paper Generated & Saved");

    } catch (err) {
      console.log(err);
      alert("❌ Generate failed");
    }
  };

  const fetchPaper = async (examId) => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/exam/paper/${examId}`
    );

    console.log("📄 PAPER RESPONSE:", res.data); // 🔥 DEBUG

    setPaper(res.data);

  } catch (err) {
    console.log("❌ FETCH ERROR:", err);
  }
};

  // ===== ASSIGN (MULTI SELECT) =====
  const handleCheckbox = (id) => {
    if (selectedExaminers.includes(id)) {
      const updated = selectedExaminers.filter(e => e !== id);
      setSelectedExaminers(updated);
      setSelectedExaminerIds(updated);
    } else {
      const updated = [...selectedExaminers, id];
      setSelectedExaminers(updated);
      setSelectedExaminerIds(updated);
    }
  };

  const assignExaminer = async () => {
    try {
      if (!selectedExam) return alert("Select exam ❌");

      await axios.put(
        `http://localhost:5000/api/exam/assign/${selectedExam}`,
        { examinerIds: selectedExaminerIds }
      );

      alert("Examiners assigned ✅");

    } catch {
      alert("Assignment failed ❌");
    }
  };

  // ===== PUBLISH =====
  const publishExam = async () => {
    try {
      if (!selectedExam) return alert("Select exam ❌");

      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/exam/publish/${selectedExam}`,
        {},
        { headers: { "x-auth-token": token } }
      );

      alert("✅ Published");

    } catch (err) {
      console.log(err);
      alert("❌ Publish failed");
    }
  };

  // ===== DELETE =====
  const deleteExam = async () => {
    try {
      if (!selectedExam) return alert("Select exam ❌");

      await axios.delete(`http://localhost:5000/api/exam/${selectedExam}`);

      alert("Deleted ✅");
      loadExams();
      setSelectedExam("");
    } catch {
      alert("Delete failed ❌");
    }
  };

  // ===== UI =====
  return (
  <div className="content" style={{ maxWidth: "900px", margin: "auto" }}>
    <h2 style={{ textAlign: "center" }}>👨‍💼 Admin Panel</h2>

    {/* ================= CREATE EXAM ================= */}
    <div style={{ marginTop: "20px" }}>
      <h3>📘 Create Exam</h3>

      <input
        placeholder="Enter Exam Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <button onClick={createExam}>🚀 Create Exam</button>
    </div>

    <hr />

    {/* ================= SELECT EXAM ================= */}
    <div>
      <h3>📄 Select Exam</h3>

      <select
  value={selectedExam}
  onChange={(e) => setSelectedExam(e.target.value)}
>
  <option value="">Select Exam</option>

  {exams.map((ex) => (
    <option key={ex._id} value={ex._id}>
      {ex.title || "No Title"}
    </option>
  ))}
 </select>
</div>

    <hr />

    {/* ================= AI GENERATION ================= */}
    <div>
      <h3>🤖 AI Question Generator</h3>

      <input
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />

      <input
        placeholder="Topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <button onClick={generateAI} disabled={loading}>
        {loading ? "Generating..." : "Generate AI Questions"}
      </button>

      <button onClick={previewQuestionsHandler}>
        🔍 Preview Questions
      </button>

      {previewQuestions.length > 0 && (
        <div style={{
          marginTop: "15px",
          padding: "10px",
          background: "#1e1e1e",
          color: "#fff",
          borderRadius: "8px"
        }}>
          <h4 style={{ color: "#fff" }}>🧠 Preview</h4>

          {previewQuestions.map((q, i) => (
            <div key={i}>Q{i + 1}. {q}</div>
          ))}
        </div>
      )}
    </div>

      <h3 style={{ marginTop: "20px" }}>
        ✍️ Add Your Own Question
      </h3>

     <input
     placeholder="Enter Question"
     value={newQuestion}
     onChange={(e) => setNewQuestion(e.target.value)}
    />

    <input
    type="number"
    placeholder="Enter Marks for Question"
    value={marks}
    onChange={(e) => setMarks(e.target.value)}
  />

   <button onClick={() => {
    setManualQuestions([
    ...manualQuestions,
    { question: newQuestion, marks }
  ]);
  setNewQuestion("");
 }}>
  ➕ Add Question
 </button>

<hr />

    {/* ================= EXAMINERS ================= */}
    <div>
      <h3>👨‍🏫 Assign Examiner</h3>

      {examiners.map((ex) => (
        <div
          key={ex._id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px",
            borderRadius: "8px",
            marginBottom: "8px",
            backgroundColor: selectedExaminers.includes(ex._id)
              ? "#263f5c"
              : "#1e1e1e",
              color: "#fff",
            border: "1px solid #ddd",
            cursor: "pointer"
          }}
          onClick={() => handleCheckbox(ex._id)}
        >
          <input
            type="checkbox"
            checked={selectedExaminers.includes(ex._id)}
            onChange={() => handleCheckbox(ex._id)}
          />

          <span>
            {ex.name} ({ex.email})
          </span>
        </div>
      ))}

      <button onClick={assignExaminer}>Assign Selected</button>
    </div>

    <hr />

    {/* ================= ACTIONS ================= */}
    <div>
      <h3>⚙️ Actions</h3>

      <select onChange={(e) => setSelectedExaminer(e.target.value)}>
        <option value="">Select Examiner (for paper)</option>
        {examiners.map(ex => (
          <option key={ex._id} value={ex._id}>{ex.name}</option>
        ))}
      </select>

      <h3>📄 Question Paper</h3>

      {paper?.generatedPaper && (
  <>

    <div style={{
      textAlign: "center",
      marginBottom: "20px",
      fontFamily: "Times New Roman"
    }}>
    <h2 style={{ fontWeight: "bold" }}>
     Dayananda Sagar College of Arts, Science and Commerce
    </h2>

  <p style={{ fontSize: "16px" }}>
    KS Layout, Bangalore – 560111
  </p>
</div>

<button
  onClick={() => downloadPaper(paper)}
  style={{
    position: "absolute",
    right: "20px",
    top: "20px"
  }}
>
  📄 Download Paper
</button>

    <h3 style={{ color: "#38bdf8" }}>📘 Part A</h3>

    <p>{paper.generatedPaper.partA.instruction}</p>

    {paper.generatedPaper.partA.questions.map((q, i) => (
      <div key={i}>
        Q{i + 1}: {q.question} ({q.marks})
      </div>
    ))}

    <h3 style={{ color: "#38bdf8", marginTop: "15px" }}>
      📙 Part B
    </h3>

    <p>{paper.generatedPaper.partB.instruction}</p>

    {paper.generatedPaper.partB.questions.map((q, i) => (
      <div key={i}>
        Q{i + 9}: {q.question} ({q.marks})
      </div>
    ))}
    <div style={{
    textAlign: "center",
    marginTop: "40px",
    fontStyle: "italic"
  }}>
    It is a digitally generated question paper.
   </div>
  </>
 )}

      <div style={{ marginTop: "10px" }}>
        <button onClick={generatePaper}>
          🧠 Generate Full Paper
        </button>

        

        <button onClick={publishExam}>
          🚀 Publish Exam
        </button>

        <button
          onClick={deleteExam}
          style={{ background: "red", color: "white" }}
        >
          🗑 Delete Exam
        </button>
      </div>
    </div>
  </div>
);
}