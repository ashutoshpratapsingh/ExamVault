import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Sidebar(){

  const role = localStorage.getItem('role');
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path) => location.pathname === path;

  const logout = () => {
    localStorage.clear();
    window.location = '/';
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>

      {/* TOGGLE */}
      <div className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? '➡️' : '⬅️'}
      </div>

      {/* ROLE */}
      <div className="sidebar-role">
        {role === 'admin' && '👨‍💼 Admin'}
        {role === 'examiner' && '🧑‍🏫 Examiner'}
        {role === 'student' && '🎓 Student'}
      </div>

      {/* LINKS */}
      <Link className={isActive('/dashboard') ? 'active' : ''} to="/dashboard">
        🏠 {!collapsed && 'Dashboard'}
      </Link>

      {role === 'student' && (
        <Link className={isActive('/result') ? 'active' : ''} to="/result">
          📊 {!collapsed && 'Results'}
        </Link>
      )}

      {role === 'admin' && (
        <Link className={isActive('/admin') ? 'active' : ''} to="/admin">
          👨‍💼 {!collapsed && 'Admin Panel'}
        </Link>
      )}

      {role === 'examiner' && (
        <Link className={isActive('/examiner') ? 'active' : ''} to="/examiner">
          🧑‍🏫 {!collapsed && 'Examiner Panel'}
        </Link>
      )}

      {/* LOGOUT */}
      <button className="logout-btn" onClick={logout}>
        🚪 {!collapsed && 'Logout'}
      </button>

    </div>
  );
}