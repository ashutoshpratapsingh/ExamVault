import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [exams, setExams] = useState([]);
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState({});
  const [user, setUser] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [marksMap, setMarksMap] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState({});
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // ================= USER =================
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/auth/me", {
        headers: { "x-auth-token": token },
      })
      .then((res) => setUser(res.data));
  }, [token]);

  // ================= EXAMS =================
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/exam", {
        headers: { "x-auth-token": token },
      })
      .then((res) => setExams(res.data));
  }, [token]);

  // ================= HISTORY =================
  useEffect(() => {
    if (role === "student") {
      axios
        .get("http://localhost:5000/api/result/history", {
          headers: { "x-auth-token": token },
        })
        .then((res) => setHistory(res.data));
    }
  }, [role, token]);

  // ================= PROFILE =================
  useEffect(() => {
    if (role === "student") {
      axios
        .get("http://localhost:5000/api/auth/me", {
          headers: { "x-auth-token": token },
        })
        .then((res) => setProfile(res.data));
    }
  }, [role, token]);

  // ================= SUBMISSIONS =================
  const loadSubmissions = async (examId) => {
    const res = await axios.get(
      `http://localhost:5000/api/examiner/submissions/${examId}`
    );
    setSubmissions(res.data);
  };

  const getAIMarks = async (answers) => {
  try {
    const res = await axios.post(
      "http://localhost:5000/api/ai/ai-evaluate",
      { answers }
    );

    return res?.data?.totalMarks || 0;
  } catch (err) {
    console.log("AI ERROR:", err);
    return 0;
  }
};

  const handleMarksChange = (id, value) => {
  setMarksMap(prev => ({
    ...prev,
    [id]: value
  }));
};

  const saveMarks = async (sub) => {
    console.log("MANUAL MARKS:", marksMap[sub._id]);
    try {
      const formattedAnswers = sub.answers.map((a) => ({
        questionId: a.questionId,
        answer: a.answer || "",
        marks: a.marks || 5,
      }));

      const aiMarks = await getAIMarks(formattedAnswers);
      const manualMarks = Number(marksMap[sub._id] ?? 0);

      await axios.put(
        `http://localhost:5000/api/examiner/marks/${sub._id}`,
        {
          aiMarks,
          manualMarks,
          totalMarks: Number(manualMarks),
        }
      );

      setSubmissions(prev =>
      prev.map(s =>
        s._id === sub._id
          ? { ...s, manualMarks, totalMarks: manualMarks }
          : s
      )
    );

      alert("Marks saved ✅");
    } catch (err) {
      console.log("SAVE ERROR:", err);
    }
  };

  // ✅ FIXED AI (SAVE + UPDATE)
  const evaluateSelectedSubmission = async () => {
  if (!selectedSubmission) {
    alert("Select one answer sheet ❌");
    return;
  }

  try {
    const sub = submissions.find(
      (s) => s._id === selectedSubmission
    );

    const formattedAnswers = sub.answers.map((a) => ({
      questionId: a.questionId,
      answer: a.answer || "",
      marks: a.marks || 5,
    }));

    // ✅ AI CALL (CORRECT ROUTE)
    const res = await axios.post(
      "http://localhost:5000/api/ai/ai-evaluate",
      { answers: formattedAnswers }
    );

    const aiMarks = res.data.totalMarks;

   await axios.put(
   `http://localhost:5000/api/examiner/marks/${sub._id}`,
   {
     aiMarks,
     manualMarks: sub.manualMarks || aiMarks, // 👈 auto-fill with AI
     totalMarks: sub.manualMarks || aiMarks   // 👈 fallback
   }
 );

    // ✅ UPDATE UI
    setSubmissions((prev) =>
      prev.map((s) =>
        s._id === sub._id ? { ...s, aiMarks } : s
      )
    );

    alert("AI Evaluation Saved ✅");

  } catch (err) {
    console.log("AI ERROR:", err);
    alert("AI Evaluation Failed ❌");
  }
};

  // ✅ FIXED DELETE
  const deleteSubmission = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/examiner/submission/${id}`
      );

      setSubmissions((prev) =>
        prev.filter((s) => s._id !== id)
      );

      alert("Deleted ✅");
    } catch (err) {
      console.log(err);
    }
  };

  const publishResults = async (examId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/examiner/publish/${examId}`
      );
      alert("Results Published ✅");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Navbar />

      <div className="content">
        <h2>Dashboard</h2>

        <h3>
          {role === "admin" && "👨‍💼 Admin Panel"}
          {role === "examiner" && "🧑‍🏫 Examiner Panel"}
          {role === "student" && "🎓 Student Dashboard"}
        </h3>

        {/* STUDENT PROFILE */}
        {role === "student" && (
          <div className="card">
            <h3>👤 Profile</h3>
            <p><b>Name:</b> {profile.name}</p>
            <p><b>Email:</b> {profile.email}</p>
            <p><b>Course:</b> {profile.course}</p>
            <p><b>Roll No:</b> {profile.rollNo}</p>
          </div>
        )}

        {/* ADMIN PROFILE */}
        {role === "admin" && (
          <div className="card">
            <h3>👨‍💼 Admin Profile</h3>
            <p>{user?.name}</p>
          </div>
        )}

        {/* EXAMINER PROFILE */}
        {role === "examiner" && (
          <div className="card">
            <h3>🧑‍🏫 Examiner Profile</h3>
            <p>{user?.name}</p>
          </div>
        )}

        {/* CONTROL PANEL */}
<div className="card">

  {role === "student" && (
    <button onClick={() => navigate("/result")}>
      📊 View Results
    </button>
  )}

  {role === "admin" && (
    <>
      <button onClick={() => navigate("/admin")}>
        ⚙ Admin Panel
      </button>
      <button onClick={() => navigate("/result")}>
        📊 All Results
      </button>
    </>
  )}

  {role === "examiner" && (
    <>
    <button onClick={() => navigate("/examiner")}>
      🧑‍🏫 Examiner Panel
    </button>

    <button onClick={() => navigate("/result")}>
      📊 Student Results
    </button>
  </>
  )}

</div>

        {/* EXAMS */}
        <h3>Available Exams</h3>

        <div className="exam-grid">
          {exams.map((e) => (
            <motion.div key={e._id} className="exam-card">
              <h3>{e.title}</h3>

              {role === "student" && (
                <button onClick={() => navigate("/exam/" + e._id)}>
                  ▶ Start Exam
                </button>
              )}

              {role === "examiner" && (
                <>
                  <button onClick={() => loadSubmissions(e._id)}>
                    📄 View Submissions
                  </button>

                  <button onClick={() => publishResults(e._id)}>
                    🚀 Publish Result
                  </button>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* SUBMISSIONS */}
        {submissions.length > 0 && (
          <>
            <h3>📄 Student Submissions</h3>

            {submissions.map((sub) => (
              <div key={sub._id} className="card">

                <input
                  type="checkbox"
                  checked={selectedSubmission === sub._id}
                  onChange={() =>
                    setSelectedSubmission(sub._id)
                  }
                />

                <h4>{sub.studentId?.name}</h4>

                {sub.answers.map((ans, i) => (
                  <div key={i}>
                    <b>Q{i + 1}</b>
                    <p>{ans.answer}</p>
                  </div>
                ))}

                <p>🤖 AI Marks: {sub.aiMarks || 0}</p>
                <p>✏ Manual: {marksMap[sub._id] ?? sub.manualMarks ?? 0}</p>
                <p>🏁 Final: {marksMap[sub._id] ?? sub.manualMarks ?? sub.aiMarks ?? 0}</p>

                <input
                 type="number"
                 value={marksMap[sub._id] ?? sub.manualMarks ?? ""}
                 onChange={(e) =>
                 handleMarksChange(sub._id, Number(e.target.value))
                }
               />

                <button onClick={() => saveMarks(sub)}>
                  💾 Save Marks
                </button>

                <button onClick={() => deleteSubmission(sub._id)}>
                  🗑 Delete Sheet
                </button>
              </div>
            ))}

            <button onClick={evaluateSelectedSubmission}>
              🤖 Evaluate Selected Paper
            </button>
          </>
        )}

        {/* HISTORY */}
        {role === "student" && history.length > 0 && (
          <>
            <h3>📊 Previous Attempts</h3>
            {history.map((h) => (
              <div key={h._id}>
                <h4>{h.examTitle}</h4>
                <p>{h.score}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}