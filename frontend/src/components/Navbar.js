import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function Navbar(){

  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="navbar">

      {/* LEFT */}
      <h2 
        className="logo"
        onClick={()=>navigate('/dashboard')}
      >
        EXAMVAULT
      </h2>

      {/* RIGHT */}
      <div className="navbar-right">

        {/* ROLE */}
        <span className="navbar-role">
          {role === 'admin' && '👨‍💼 Admin'}
          {role === 'examiner' && '🧑‍🏫 Examiner'}
          {role === 'student' && '🎓 Student'}
        </span>

        {/* LOGOUT */}
        <button className="logout-btn" onClick={logout}>
          🚪 Logout
        </button>

      </div>

    </div>
  );
}