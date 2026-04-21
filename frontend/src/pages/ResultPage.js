const ResultPage = ({ data }) => {
  if (!data) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>📊 Exam Result</h2>

      <h3>🏆 Total Marks: {data.total}</h3>

      {data.results.map((r, i) => (
        <div key={i} style={{ marginBottom: "15px", borderBottom: "1px solid #ccc" }}>
          <p><b>Marks:</b> {r.marksAwarded}</p>
          <p><b>Feedback:</b> {r.feedback}</p>
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