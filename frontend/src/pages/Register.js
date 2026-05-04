import { useState } from 'react';
import axios from 'axios';
import '../App.css';
import loginImg from '../Welcome to ExamVault system.png';
import { motion } from 'framer-motion';

export default function Register() {

  const [data, setData] = useState({
  name: '',
  email: '',
  password: '',
  role: 'student',
  course: '',
  rollNumber: '',   // ✅ ADD HERE
  sessionYear: '',
  phone: ''
});

  // ✅ REGISTER FUNCTION
  const register = async () => {
  try {
    console.log("SENDING:", data);

    if (!data.name || !data.email || !data.password) {
      return alert('Please fill required fields ❌');
    }

    if (data.role === 'student') {
      if (!data.course || !data.sessionYear || !data.phone) {
        return alert('Please fill all student details ❌');
      }
    }

    await axios.post("http://localhost:5000/api/auth/register", {
      name: data.name,
      email: data.email,
      password: data.password,
      rollNumber: data.rollNumber,
      role: data.role,
      course: data.course,
      sessionYear: data.sessionYear,
      phone: data.phone
    });

    alert('Registered Successfully ✅');
    window.location = '/';

  } catch (err) {
    console.error(err);
    alert(err.response?.data || 'Registration Failed ❌');
  }
};

  return (
    <div className="auth-wrapper">

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >

        {/* LEFT IMAGE */}
        <div className="auth-left">
          <img src={loginImg} alt="register" />
        </div>

        {/* RIGHT FORM */}
        <div className="auth-right">

          <h2>Create Account 🚀</h2>
          <p>Register to get started</p>

          <input
            placeholder="Full Name"
            value={data.name}
            onChange={e =>
            setData(prev => ({ ...prev, name: e.target.value }))
           }
          />

        {data.role === 'student' && (
         <>
          <input
          type="text"
          placeholder="Roll Number"
          value={data.rollNumber}
          onChange={(e) =>
          setData(prev => ({
          ...prev,
          rollNumber: e.target.value
       }))
      }
    />
        </>
        )}

          <input
            placeholder="Email Address"
            value={data.email}
            onChange={e =>
            setData(prev => ({ ...prev, email: e.target.value }))
           }
          />

          <input
            type="password"
            placeholder="Password"
            value={data.password}
            onChange={e =>
            setData(prev => ({ ...prev, password: e.target.value }))
           }
          />

          {/* 🎓 STUDENT FIELDS */}
          {data.role === 'student' && (
            <>
              <input
                placeholder="Course"
                value={data.course}
                onChange={e =>
                setData(prev => ({ ...prev, course: e.target.value }))
               }
              />

              <input
                placeholder="Session Year"
                value={data.sessionYear}
                onChange={e =>
                setData(prev => ({ ...prev, sessionYear: e.target.value }))
               }
              />

              <input
                placeholder="Phone Number"
                value={data.phone}
                onChange={e =>
                setData(prev => ({ ...prev, phone: e.target.value }))
               }
              />
            </>
          )}

          {/* ROLE SELECT */}
          <select
            value={data.role}
            onChange={e => setData({ ...data, role: e.target.value })}
          >
            <option value="student">Student</option>
            <option value="examiner">Examiner</option>
            <option value="admin">Admin</option>
          </select>

          {/* ✅ FIXED BUTTON */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={register}
          >
            Register
          </motion.button>

          <p className="link" onClick={() => window.location = '/'}>
            Already have an account? Login
          </p>

        </div>

      </motion.div>

    </div>
  );
}