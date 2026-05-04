import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { downloadPaper } from "../utils/downloadPaper";

const ExamPage = () => {
  const { id: examId } = useParams();
  const [examIdState, setExamId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3 * 60 * 60); // 3 hours in seconds
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [examStatus, setExamStatus] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showDiagramUpload, setShowDiagramUpload] = useState(false);
  const [diagrams, setDiagrams] = useState({});
  const [paper, setPaper] = useState(null); // 🔥 ADD THIS

  // 🔹 Fetch selected exam
  const loadExam = async () => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/exam/${examId}`
    );

    console.log("📄 FULL EXAM:", res.data);

    setExamStatus(res.data.status);
    setStartTime(res.data.startTime);
    setEndTime(res.data.endTime);

    setPaper({
      title: res.data.title,
      generatedPaper: res.data.generatedPaper
    });

    const allQuestions = [
      ...(res.data.generatedPaper?.partA?.questions || []),
      ...(res.data.generatedPaper?.partB?.questions || [])
    ];

    setQuestions(allQuestions);

  } catch (err) {
    console.error("❌ LOAD ERROR:", err);
  }
};

const goFullscreen = () => {
  document.documentElement.requestFullscreen().catch(() => {});
};

  // 🔥 MONITORING STATES
  const [violations, setViolations] = useState(0);
  const MAX_VIOLATIONS = 3;

  const token = localStorage.getItem("token");
  let user = null;

try {
  const storedUser = localStorage.getItem("user");
  user = storedUser && storedUser !== "undefined"
    ? JSON.parse(storedUser)
    : null;
} catch (err) {
  console.log("User parse error:", err);
  user = null;
}

  console.log("USER DATA:", user);

  // ================= LOAD SAVED ANSWERS =================
  let saved = {};

try {
  const data = localStorage.getItem("answers");
  saved = data ? JSON.parse(data) : {};
} catch (err) {
  console.log("Parse error:", err);
  saved = {};
}

  // ================= LOG VIOLATION =================
  const logViolation = async (type) => {
    try {
      await axios.post(
        "http://localhost:5000/api/monitor/log",
        {
          studentId: user?._id,
          name: user?.name,
          rollNo: user?.rollNo,
          examId: examId,
          type,
        },
        {
          headers: { "x-auth-token": token },
        }
      );

      setViolations((prev) => prev + 1);

      alert(`⚠️ Warning: ${type}`);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= TAB SWITCH =================
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        logViolation("TAB_SWITCH");
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // ================= FULLSCREEN =================
  useEffect(() => {
    const goFullscreen = () => {
      document.documentElement.requestFullscreen().catch(() => {});
    };

    goFullscreen();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logViolation("EXIT_FULLSCREEN");
        goFullscreen();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // ================= DISABLE COPY =================
  useEffect(() => {
    const disableRightClick = (e) => {
      e.preventDefault();
      logViolation("RIGHT_CLICK");
    };

    const disableCopy = (e) => {
      e.preventDefault();
      logViolation("COPY_ATTEMPT");
    };

    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("copy", disableCopy);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("copy", disableCopy);
    };
  }, []);

  // ================= AUTO DISQUALIFY =================
  useEffect(() => {
    if (violations >= MAX_VIOLATIONS) {
      alert("❌ You are disqualified due to cheating!");
      window.location = "/dashboard";
    }
  }, [violations]);

  // ================= HANDLE ANSWER =================
  const handleChange = (qId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: value,
    }));
  };

  // 🔹 Handle answer typing
  const handleAnswerChange = (questionId, value) => {
  setAnswers(prev => {
    const updated = {
      ...prev,
      [questionId]: value
    };

    localStorage.setItem("answers", JSON.stringify(updated));
    return updated;
  });
};

  const formattedAnswers = Object.keys(answers).map(qId => ({
  questionId: qId,
  answer: answers[qId]
}));

useEffect(() => {
  try {
    const saved = localStorage.getItem("answers");
    if (saved) {
      setAnswers(JSON.parse(saved));
    }
  } catch (err) {
    console.log("Load error:", err);
  }
}, []);

  // ================= AUTO SAVE =================
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem("answers", JSON.stringify(answers));
    }, 10000);

    return () => clearInterval(interval);
  }, [answers]);

  // 🔹 Timer calculation
  useEffect(() => {
  const timer = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearInterval(timer);
        alert("⏰ Time Over! Auto submitting...");
        handleFinalSubmit();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, []);

useEffect(() => {
  const start = localStorage.getItem("examStartTime");

  if (!start) {
    localStorage.setItem("examStartTime", Date.now());
  }
}, []);

  const handleFinalSubmit = async () => {
  try {
    const token = localStorage.getItem("token");

    const formattedAnswers = questions.map((q) => ({
      questionId: q._id,
      answer: answers[q._id] || ""
    }));

    await axios.post(
      "http://localhost:5000/api/exam/submit",
      {
        examId,
        answers: formattedAnswers
      },
      {
        headers: { "x-auth-token": token }
      }
    );

    alert("Exam submitted successfully ✅");

    localStorage.removeItem("answers");

  } catch (err) {
    console.log(err);
    alert("Submit failed ❌");
  }
};

const getTimeLeft = () => {
  const totalSeconds = timeLeft;

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return `${h}h ${m}m ${s}s`;
};

  return (
    <div
     style={{
     padding: "20px",
     backgroundColor: "#f5f5f5",
     color: "#000"
   }}
  >
      <h2 style={{ color: "#000" }}>🎓 Student Dashboard</h2>

      <button onClick={loadExam}>Load Exam</button>

      {examStatus === "started" && (
      <h3 style={{ color: "red" }}>
      ⏱ Time Left: {getTimeLeft()}
     </h3>
     )}

      {/* 🟡 DISTRIBUTED MODE */}
      {examStatus === "distributed" && (
        <div>
          {paper && paper.generatedPaper && (
      <div style={{
        background: "#fff",
        color: "#000",
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

     <button onClick={() => downloadPaper(paper)}
      style={{
      position: "absolute",
      right: "20px",
      top: "20px"
      }}
     >
      📄 Download Question Paper
     </button>

        <h2 style={{ textAlign: "center" }}>📄 Question Paper</h2>

        <div style={{ textAlign: "center", marginBottom: "15px" }}>
         <b>⏳ Time Left: {getTimeLeft()}</b> | <b>Max Marks: 70</b>
        </div>

          <h4>Part A</h4>
          {paper.generatedPaper.partA?.questions?.map((q, i) => (
          <div key={q._id}>
           Q{i + paper.generatedPaper.partA.questions.length + 1}. {q.question} ({q.marks} Marks)
           </div>
          ))}

          <h4>Part B</h4>
          {paper.generatedPaper.partB?.questions?.map((q, i) => (
          <div key={q._id}>
          Q{i + 9}. {q.question} ({q.marks} Marks)
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
      </div>
    )}

      {/* 🟢 STARTED MODE */}
      {examStatus === "started" && questions.length > 0 && (
        <div>
          <h3>
            Q{currentQuestion + 1}. {questions[currentQuestion].question}
         </h3>

          <p>Marks: {questions[currentQuestion].marks}</p>

          <textarea
          rows="5"
          style={{
          width: "100%",
          marginTop: "10px",
          backgroundColor: "#fff",
          color: "#000"
        }}
        placeholder="Write your answer..."
        disabled={isLocked}
        value={answers[questions[currentQuestion]?._id] || ""}
        onChange={(e) =>
        handleAnswerChange(
        questions[currentQuestion]?._id,
        e.target.value
       )
      }
    />

       {paper && paper.generatedPaper && (
  <div>

    <h2>{paper.title}</h2>

    <h3>Part A</h3>
    <p>{paper.generatedPaper.partA?.instruction}</p>

    {paper.generatedPaper.partA?.questions?.map((q, i) => (
      <div key={q._id}>
        Q{i + 1}. {q.question} ({q.marks} Marks)
        <textarea
         value={answers[q._id] || ""}
         onChange={(e) =>
         handleAnswerChange(q._id, e.target.value)
       }
       style={{
       width: "100%",
       minHeight: "100px",
       marginTop: "5px",
       padding: "10px",
       backgroundColor: "#fff",
       color: "#000",
       border: "1px solid #ccc",
       borderRadius: "5px"
      }}
     />
      </div>
    ))}

    <h3>Part B</h3>
    <p>{paper.generatedPaper.partB?.instruction}</p>

    {paper.generatedPaper.partB?.questions?.map((q, i) => (
      <div key={q._id}>
        Q{i + 9}. {q.question} ({q.marks} Marks)
        <textarea
        value={answers[q._id] || ""}
        onChange={(e) =>
        handleAnswerChange(q._id, e.target.value)
       }
       style={{
       width: "100%",
       minHeight: "100px",
       marginTop: "5px",
       padding: "10px",
       backgroundColor: "#fff",
       color: "#000",
       border: "1px solid #ccc",
       borderRadius: "5px"
     }}
    />
      </div>
    ))}

  </div>
)}

          {/* 🔁 Navigation */}
          <div style={{ marginTop: "10px" }}>
            <button
              disabled={currentQuestion === 0}
              onClick={() =>
                setCurrentQuestion(currentQuestion - 1)
              }
            >
              Prev
            </button>

            <button
              disabled={currentQuestion === questions.length - 1}
              onClick={() =>
                setCurrentQuestion(currentQuestion + 1)
              }
            >
              Next
            </button>
          </div>

          {/* 🔢 Jump to question */}
          <div style={{ marginTop: "10px" }}>
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestion(i)}
                style={{
                  margin: "2px",
                  background:
                    currentQuestion === i ? "#1890ff" : "#ddd",
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
          onClick={() => {
          setIsLocked(true);
          setShowDiagramUpload(true);
         }}
         style={{
         marginTop: "15px",
         background: "orange",
         padding: "10px"
       }}
       >
        Submit Theory
       </button>

       {showDiagramUpload && (
     <div style={{ marginTop: "20px" }}>
     <h3>📎 Upload Diagrams</h3>

     <input
      type="file"
       multiple
       onChange={(e) => {
        const files = e.target.files;
        let newDiagrams = { ...diagrams };

        for (let i = 0; i < files.length; i++) {
          newDiagrams[i] = files[i];
        }

        setDiagrams(newDiagrams);
       }}
      />
     </div>
    )}

    <button
     onClick={handleFinalSubmit}
     style={{
     marginTop: "15px",
     background: "green",
     color: "#fff",
     padding: "10px"
   }}
>
    Final Submit
  </button>

          {result && (
              <p>
                Marks:{" "}
                {
                  result.results.find(
                  (r) => r.questionId === questions[currentQuestion]?._id
                 )?.marks || 0
                }
              </p>
            )}

        </div>
      )}
    </div>
  );
};

export default ExamPage;