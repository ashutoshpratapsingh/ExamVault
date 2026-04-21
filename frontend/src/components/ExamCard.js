import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ExamCard({ exam, role }) {

  const navigate = useNavigate();

  const handleClick = () => {
    if (role === 'student') {
      navigate('/exam/' + exam._id);
    } 
    else if (role === 'examiner') {
      navigate('/admin'); // ya examiner panel
    } 
    else if (role === 'admin') {
      navigate('/admin');
    }
  };

  return (
    <div className="exam-card">

      {/* Title */}
      <h3>{exam.title}</h3>

      {/* Info */}
      <p>
        📚 {exam.category || 'General'} • 
        🎯 {exam.difficulty || 'easy'}
      </p>

      {/* Duration */}
      <p>
        ⏱ {exam.duration || 0} mins
      </p>

      {/* Schedule */}
      {exam.scheduledAt && (
        <p style={{ fontSize: '12px', color: '#666' }}>
          📅 {new Date(exam.scheduledAt).toLocaleString()}
        </p>
      )}

      {/* BUTTON */}
      <button onClick={handleClick}>

        {role === 'student' && '▶ Start Exam'}
        {role === 'examiner' && '✏ Manage'}
        {role === 'admin' && '⚙ Manage'}

      </button>

    </div>
  );
}