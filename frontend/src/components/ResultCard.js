import React from 'react';

export default function ResultCard({ result, index }) {

  const percentage = result.percentage
    ? Math.round(result.percentage)
    : (result.totalMarks 
        ? Math.round((result.score / result.totalMarks) * 100) 
        : result.score);

  let grade = 'C';
  if (percentage >= 80) grade = 'A';
  else if (percentage >= 60) grade = 'B';

  const getBadgeClass = () => {
    if (grade === 'A') return 'badge success';
    if (grade === 'B') return 'badge warning';
    return 'badge danger';
  };

  return (
    <div className="card">

      {/* Exam Title */}
      <h3>{result.examId?.title || `Test ${index + 1}`}</h3>

      {/* Score */}
      <p>
        Score: <b>{result.score}</b> / {result.totalMarks || '-'}
      </p>

      {/* Percentage */}
      <p>
        Percentage: <b>{percentage}%</b>
      </p>

      {/* Grade */}
      <p>
        Grade:
        <span className={getBadgeClass()}>
          {grade}
        </span>
      </p>

      {/* Date */}
      <p style={{ fontSize: '12px', color: '#777' }}>
        📅 {new Date(result.createdAt).toLocaleString()}
      </p>

    </div>
  );
}