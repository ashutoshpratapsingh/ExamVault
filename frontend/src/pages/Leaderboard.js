import { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';

export default function Leaderboard() {

  const [data, setData] = useState([]);
  const [examId, setExamId] = useState('');

  useEffect(() => {
    if (!examId) return;

    axios.get(`http://localhost:5000/api/result/leaderboard/${examId}`, {
      headers: { 'x-auth-token': localStorage.getItem('token') }
    })
      .then(res => setData(res.data))
      .catch(err => console.log(err));
  }, [examId]);

  return (
    <div className="content">

      <h2>🏆 Leaderboard</h2>

      {/* SELECT EXAM */}
      <div className="card">
        <input
          type="text"
          placeholder="Enter Exam ID..."
          value={examId}
          onChange={(e) => setExamId(e.target.value)}
        />
      </div>

      {/* EMPTY */}
      {data.length === 0 && examId && <p>No data found</p>}

      {/* TABLE */}
      {data.length > 0 && (
        <div className="table-box">

          <h3>Top Performers</h3>

          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Score</th>
                <th>Percentage</th>
              </tr>
            </thead>

            <tbody>
              {data.map((user, index) => {

                const percentage = user.percentage
                  ? Math.round(user.percentage)
                  : user.score;

                return (
                  <tr key={user._id}>

                    <td>
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && index + 1}
                    </td>

                    <td>{user.userId?.name || 'User'}</td>

                    <td>{user.score}</td>

                    <td>{percentage}%</td>

                  </tr>
                );
              })}
            </tbody>
          </table>

        </div>
      )}

    </div>
  );
}