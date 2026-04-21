import { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";

export default function ExaminerPanel() {

  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState("");
  const [user, setUser] = useState(null);
  const [paper, setPaper] = useState(null);
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const btnStyle = {
  marginRight: "10px",
  padding: "10px 15px",
  background: "#2c3e50",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

  const token = localStorage.getItem("token");

  // 🔐 ROLE CHECK
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "examiner" && role !== "admin") {
      alert("Access Denied ❌");
      window.location = "/dashboard";
    }
  }, []);

  // 👤 USER
  useEffect(() => {
    axios.get("http://localhost:5000/api/auth/me", {
      headers: { "x-auth-token": token }
    })
    .then(res => setUser(res.data))
    .catch(err => console.log(err));
  }, [token]);

  // 📚 EXAMS
  useEffect(() => {
    axios.get("http://localhost:5000/api/exam/my-exams", {
      headers: { "x-auth-token": token }
    })
    .then(res => setExams(res.data))
    .catch(err => console.log(err));
  }, [token]);

  // 📄 FETCH PAPER
  useEffect(() => {
    if (!examId) return;

    axios.get(`http://localhost:5000/api/exam/paper/${examId}`, {
      headers: { "x-auth-token": token }
    })
    .then(res => {
    console.log("📄 PAPER RESPONSE:", res.data); // 🔥 ADD THIS
    setPaper(res.data);
    setAnalytics(null);
  })
    .catch(err => console.log(err));

  }, [examId, token]);

  // 👁 MONITOR
  useEffect(() => {
    if (!examId) return;

    const fetchStudents = () => {
      axios.get(`http://localhost:5000/api/monitor/${examId}`, {
        headers: { "x-auth-token": token }
      })
      .then(res => {
      console.log("STUDENTS DATA:", res.data);
      setStudents(res.data);
    })
    .catch(err => console.log(err));
  };

    fetchStudents();
    // const interval = setInterval(fetchStudents, 5000);
   // return () => clearInterval(interval);

  }, [examId, token]);

  // 🟢 START EXAM
  const startExam = async () => {
  if (!examId) return alert("Select exam first ❌");

  try {
    await axios.put(
      `http://localhost:5000/api/exam/start/${examId}`,
      {},
      { headers: { "x-auth-token": token } }
    );

    alert("Exam Started 🟢");

    // 🔥 REFRESH PAPER + EXAM DATA
    setPaper(null);

    const res = await axios.get(
      `http://localhost:5000/api/exam/paper/${examId}`,
      { headers: { "x-auth-token": token } }
    );

    setPaper(res.data);

  } catch (err) {
    console.log(err);
  }
};

  // 🚀 DISTRIBUTE
  const distributePaper = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/exam/distribute/${examId}`,
        {},
        { headers: { "x-auth-token": token } }
      );
      alert("Paper Distributed ✅");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
  const interval = setInterval(() => {
    setCurrentIndex(prev =>
      (prev + 1) % students.length
    );
  }, 3000);

  return () => clearInterval(interval);
}, [students]);

if (!user) return <h2>Loading...</h2>;

  return (
  <div style={{ padding: "30px", background: "#f5f7fb", minHeight: "100vh", color: "#000" }}>

    {/* HEADER */}
    <div style={{
      textAlign: "center",
      background: "#fff",
      padding: "20px",
      borderRadius: "10px",
      marginBottom: "20px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
    }}>
      <h2>🎓 University Examination System</h2>
      <h3>🧑‍🏫 Examiner Panel</h3>
      <p>Welcome, {user.name}</p>
    </div>

    {/* SELECT EXAM */}
    <div className="card">
      <h3>Select Exam</h3>
      <select value={examId} onChange={(e) => setExamId(e.target.value)}>
        <option value="">Select Exam</option>
        {exams.map(e => (
          <option key={e._id} value={e._id}>{e.title}</option>
        ))}
      </select>
    </div>

    {/* MONITORING */}
    {examId && (

  <div className="card" style={{ width: "100%", minHeight: "200px" }}>
  <h3 style={{ background: "#08042a",color: "#000" }}>👁 Student Monitoring</h3>

  {students.length > 0 ? (
    <div style={{ textAlign: "center" }}>

      <table style={{ width: "100%", color: "#000" }}>
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Violations</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>{students[currentIndex]?.rollNo || "N/A"}</td>
            <td>{students[currentIndex]?.violations}</td>
            <td>
              {students[currentIndex]?.violations === 0 && "🟢 Safe"}
              {students[currentIndex]?.violations > 0 &&
                students[currentIndex]?.violations < 3 && "⚠ Warning"}
              {students[currentIndex]?.violations >= 3 && "🔴 Cheating"}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 🔽 NAVIGATION */}
      <div style={{ marginTop: "15px" }}>
        <button
          onClick={() =>
            setCurrentIndex(prev => Math.max(prev - 1, 0))
          }
        >
          ⬆
        </button>

        <span style={{ margin: "0 10px" }}>
          {currentIndex + 1} / {students.length}
        </span>

        <button
          onClick={() =>
            setCurrentIndex(prev =>
              Math.min(prev + 1, students.length - 1)
            )
          }
        >
          ⬇
        </button>
      </div>

    </div>
  ) : (
    <p className="no-student-text">No students detected</p>
  )}
 </div>
)}



    {/* QUESTION PAPER */}
    {paper && paper.generatedPaper && (
      <div style={{
        background: "#fff",
        padding: "25px",
        borderRadius: "10px",
        marginTop: "20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>

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
  onClick={() => window.print()}
  style={{
    position: "absolute",
    right: "20px",
    top: "20px"
  }}
>
  📥 Download Paper
</button>

        <h2 style={{ textAlign: "center" }}>📄 Question Paper</h2>

        <div style={{ textAlign: "center", marginBottom: "15px" }}>
          <b>Time: 3 Hours</b> | <b>Max Marks: 70</b>
        </div>

        {/* PART A */}
        <h3 style={{ color: "#2c3e50" }}>📘 Part A</h3>
        <p><i>{paper.generatedPaper.partA?.instruction}</i></p>

        {paper.generatedPaper.partA?.questions?.map((q, i) => (
          <div key={i} style={{ marginBottom: "10px" }}>
            <b>Q{i + 1}.</b> {q.question}
            <div style={{ fontSize: "12px" }}>Marks: {q.marks}</div>
          </div>
        ))}

        {/* PART B */}
        <h3 style={{ color: "#2c3e50", marginTop: "20px" }}>📙 Part B</h3>
        <p><i>{paper.generatedPaper.partB?.instruction}</i></p>

        {paper.generatedPaper.partB?.questions?.map((q, i) => (
          <div key={i} style={{ marginBottom: "10px" }}>
            <b>Q{i + 1 + paper.generatedPaper.partA.questions.length}.</b> {q.question}
            <div style={{ fontSize: "12px" }}>Marks: {q.marks}</div>
          </div>
        ))}
        <div style={{
        textAlign: "center",
        marginTop: "40px",
        fontStyle: "italic"
      }}>
       It is a digitally generated question paper.
    </div>
  </div>
)}

    {/* ACTIONS */}
    {examId && (
      <div style={{ marginTop: "20px" }}>
        <button onClick={startExam} style={btnStyle}>🟢 Start Exam</button>
        <button onClick={distributePaper} style={btnStyle}>🚀 Distribute Paper</button>
      </div>
    )}

    {/* ANALYTICS */}
    {analytics && (
      <div style={{
        background: "#fff",
        marginTop: "20px",
        padding: "20px",
        borderRadius: "10px"
      }}>
        <h3>📊 Result Analytics</h3>
        <p>Average: {analytics.average}</p>
        <p>Highest: {analytics.highest}</p>
        <p>Lowest: {analytics.lowest}</p>
        <p>Pass %: {analytics.passPercentage}</p>
      </div>
    )}
  </div>
)};