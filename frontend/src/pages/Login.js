import { useState } from 'react';
import axios from 'axios';
import '../App.css';
import loginImg from '../Welcome to ExamVault system.png';

export default function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    try {
      if (!email || !password) {
        return alert('Please enter email & password');
      }

      setLoading(true);

      const res = await axios.post(
        'http://localhost:5000/api/auth/login',
        {
          email: email.toLowerCase(),
          password
        }
      );

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert('Login Successful ✅');
      window.location = '/dashboard';

    } catch (err) {
      alert(err.response?.data || 'Invalid credentials ❌');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">

      <div className="auth-card">

        {/* LEFT */}
        <div className="auth-left">
          <img src={loginImg} alt="login" />
        </div>

        {/* RIGHT */}
        <div className="auth-right">

          <h2>Welcome Back 👋</h2>
          <p>Login to continue</p>

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={login} disabled={loading}>
            {loading ? 'Logging...' : 'Login'}
          </button>

          <p className="link" onClick={() => window.location = '/register'}>
            Don't have an account? Create Account
          </p>

        </div>

      </div>

    </div>
  );
}