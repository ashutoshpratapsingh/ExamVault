const ResultPage = ({ data }) => {
  console.log("RESULT DATA:", data);
  if (!data) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>📊 Exam Result</h2>

      <h3>🏆 Total Marks: {data.total}</h3>

      <h3>📄 Detailed Evaluation</h3>

{data.answers && data.answers.map((a, i) => (
  <div key={i} style={{
    marginBottom: "15px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "8px"
  }}>

    <p><b>Question {i + 1}</b></p>

    <p><b>Your Answer:</b> {a.answer}</p>

    <p><b>Marks:</b> {a.marksAwarded ?? a.marks ?? 0}</p>

    <p><b>Feedback:</b> {a.feedback || "No feedback available"}</p>

  </div>
))}

      {data.answers && data.answers.map((a, i) => (
  <div key={i} style={{
    marginBottom: "15px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "8px"
  }}>

    <p><b>Question {i + 1}</b></p>

    <p><b>Your Answer:</b> {a.answer}</p>

    <p><b>Marks:</b> {a.marksAwarded ?? a.marks ?? 0}</p>

    <p><b>Feedback:</b> {a.feedback || "No feedback available"}</p>

  </div>
))}

      <h3>⚠️ Weak Topics:</h3>
      <ul>
        {Object.keys(data.weakTopics || {}).map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  );
};

export default ResultPage;