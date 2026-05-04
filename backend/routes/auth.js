const express = require('express');
const router = express.Router();

const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// ================= REGISTER =================
router.post('/register', async (req, res) => {
  console.log("REGISTER BODY:", req.body);
  try {
    const { 
      name, 
      email, 
      password, 
      role,
      course,
      rollNumber,
      sessionYear,
      phone
    } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    const bcrypt = require("bcryptjs");

    const user = new User({
    name,
    email: email.toLowerCase(),
    password,   // ✅ plain password only
    role,
    course,
    rollNumber,
    sessionYear,
    phone
  });

    await user.save();

    return res.send('Registered Successfully');

  } catch (err) {
    console.log("REGISTER ERROR:", err);
    return res.status(500).send('Error');
  }
});


// ================= LOGIN =================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return res.status(400).send('User not found');
    }

     const valid = await user.comparePassword(password.trim());

     console.log("ENTERED:", password);
     console.log("STORED:", user.password);
     console.log("COMPARE RESULT:", await bcrypt.compare(password, user.password));
     console.log("VALID (method):", valid);

     console.log("VALID:", valid);

    if (!valid) {
      return res.status(400).send('Wrong password');
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      'secret'
    );

    return res.send({
      token,
      role: user.role,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber,
        course: user.course,
        sessionYear: user.sessionYear,
        phone: user.phone
      }
    });

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    return res.status(500).send('Error');
  }
});


// ================= GET CURRENT USER =================
router.get('/me', authMiddleware, async (req, res) => {
  try {
    console.log("REQ.USER:", req.user);

    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    return res.json(user);

  } catch (err) {
    console.error("ME ERROR:", err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
});


// ================= GET ALL EXAMINERS =================
router.get('/examiners', async (req, res) => {
  try {
    const users = await User.find({ role: 'examiner' });
    return res.send(users);
  } catch (err) {
    console.log("EXAMINERS ERROR:", err);
    return res.status(500).send('Error');
  }
});


// ================= UPDATE PERMISSIONS =================
router.put('/permission/:id', async (req, res) => {
  try {
    const { canManageQuestions, canReleaseExam } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { canManageQuestions, canReleaseExam },
      { new: true }
    );

    if (!user) {
      return res.status(404).send('User not found');
    }

    return res.send(user);

  } catch (err) {
    console.log("PERMISSION ERROR:", err);
    return res.status(500).send('Error updating permission');
  }
});

module.exports = router;