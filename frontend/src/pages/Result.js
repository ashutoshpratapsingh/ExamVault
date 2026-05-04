import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../App.css';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Result() {

  const [results, setResults] = useState([]);
  const role = localStorage.getItem('role');

  useEffect(() => {
    axios.get('http://localhost:5000/api/result', {
      headers: { 'x-auth-token': localStorage.getItem('token') }
    })
    .then(res => {
      console.log("RESULT DATA 👉", res.data); // 🔥 DEBUG
      setResults(res.data);
    })
    .catch(err => console.log(err));
  }, []);

  // ===== AVG % =====
  const avgScore = results.length
  ? Math.round(
      (results.reduce((sum, r) => sum + (r.totalMarks || 0), 0)
        / (results.length * 70)) * 100
    )
  : 0;
    
  const bestScore = results.length
    ? Math.max(...results.map(r => r.totalMarks))
    : 0;

  const data = {
    labels: results.map(r =>
  r.examId?.title || r.examTitle || "Exam"
  ),
    datasets: [
      {
        label: 'Score',
        data: results.map(r => r.totalMarks),
        backgroundColor: '#2563eb'
      }
    ]
  };

  const options = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    tooltip: {
      callbacks: {
        label: function(context) {
          const r = results[context.dataIndex];
          const role = localStorage.getItem("role");

          // 🟢 STUDENT VIEW (no studentId)
          if (role === "student") {
            return [
              `Exam: ${r.examId?.title || r.examTitle || "Unknown Exam"}`,
              `Marks: ${r.totalMarks || 0}`
            ];
          }

          // 🔵 ADMIN / EXAMINER VIEW
          return [
            `Name: ${r.studentId?.name || "N/A"}`,
            `Roll No: ${r.studentId?.rollNumber || "N/A"}`,
            `Course: ${r.studentId?.course || "N/A"}`,
            `Marks: ${r.totalMarks || 0}`
          ];
        }
      }
    }
  }
};

  return (
    <>
      <Navbar />

      <div className="content">

        <h2>
          {role === 'admin' && '📊 All Results'}
          {role === 'examiner' && '📊 Student Results'}
          {role === 'student' && '📊 Your Results'}
        </h2>

        {/* ===== STATS ===== */}
        {results.length > 0 && (
          <div className="stats-container">

            <div className="stat-card">
              <h3>Average %</h3>
              <h1>{avgScore}%</h1>
            </div>

            <div className="stat-card">
              <h3>Best Score</h3>
              <h1>{bestScore}</h1>
            </div>

            <div className="stat-card">
              <h3>Total Tests</h3>
              <h1>{results.length}</h1>
            </div>

          </div>
        )}

        {/* ===== EMPTY ===== */}
        {results.length === 0 && <p>No results found</p>}

        {/* ===== RESULT LIST ===== */}
        {results.map((r, i) => {

          const role = localStorage.getItem("role");

          const totalMarks = r.totalMarks || 0;
          const maxMarks = r.examId?.totalMarks || 70; // your exam total

          const percentage = Math.round((totalMarks / maxMarks) * 100);

          const getGrade = (p) => {
           if (p >= 75) return "A";
           if (p >= 60) return "B";
           if (p >= 40) return "C";
           return "F";
          };

          const grade = getGrade(percentage);

          return (
            <div className="card" key={r._id}>

              <h3>{r.examId?.title || `Test ${i + 1}`}</h3>

              {/* 🔥 ADMIN VIEW → show student name */}
              {role !== "student" && (
              r.studentId ? (
             <div>
                <p><strong>Name:</strong> {r.studentId.name}</p>
                <p><strong>Course:</strong> {r.studentId.course}</p>
                <p><strong>Roll No:</strong> {r.studentId.rollNumber}</p>
           </div>
           ) : (
          <p style={{ color: "red" }}>⚠ Student data not found</p>
          )
        )}
        
              <p>Score: {r.totalMarks || '-'}</p>
              <p>Percentage: {percentage}%</p>

              <p>
                Grade:
                <span className={`badge ${
                  grade === 'A' ? 'success' :
                  grade === 'B' ? 'warning' : 'danger'
                }`}>
                  {grade}
                </span>
              </p>

            </div>
          );
        })}

        {/* ===== CHART ===== */}
        {results.length > 0 && (
          <div className="card chart-card">
            <h3>📈 Performance Chart</h3>

            <div className="chart-container" style={{ height: '300px' }}>
              <Bar data={data} options={options} />
            </div>

          </div>
        )}

      </div>
    </>
  );
}