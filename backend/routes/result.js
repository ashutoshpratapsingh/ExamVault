const router = require('express').Router();
const Result = require('../models/Result');
const Question = require('../models/Question');
const auth = require('../middleware/auth');
const Submission = require("../models/Submission");

// 📊 ANALYTICS
router.get("/analytics/:examId", async (req, res) => {
  try {

    console.log("Analytics HIT:", req.params.examId);

    const submissions = await Submission.find({
      examId: req.params.examId,
      status: "published"
    });

    if (submissions.length === 0) {
      return res.status(404).json({ msg: "No results found ❌" });
    }

    let total = 0;
    let highest = -Infinity;
    let lowest = Infinity;
    let passCount = 0;

    submissions.forEach(sub => {
      const marks = sub.totalMarks || 0;

      total += marks;
      highest = Math.max(highest, marks);
      lowest = Math.min(lowest, marks);

      if (marks >= 35) passCount++;
    });

    const average = total / submissions.length;
    const passPercentage = (passCount / submissions.length) * 100;

    res.json({
      average: average.toFixed(2),
      highest,
      lowest,
      passPercentage: passPercentage.toFixed(2)
    });

  } catch (err) {
    console.log("ANALYTICS ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
});

// ================= GET RESULTS =================
router.get('/', auth, async (req, res) => {
  try {
    let results;

    if (req.user.role === 'admin' || req.user.role === 'examiner') {
      results = await Submission.find({ status: "published" })
        .populate('examId', 'title')
        .populate('studentId', 'name email rollNumber course');
    } else {
      results = await Submission.find({
        studentId: req.user.id,
        status: "published"
      }).populate('examId', 'title');
    }

    console.log("RESULT API DATA 👉", results); // 🔥 ADD THIS

    res.json(results);

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Error fetching results' });
  }
});

router.get("/history", auth, async (req, res) => {
  try {
    const results = await Submission.find({
      studentId: req.user.id,
      status: "published"
    }).populate("examId", "title");

    res.json(results);

  } catch (err) {
    res.status(500).json({ msg: "Error fetching history" });
  }
});

// ================= SUBMIT EXAM =================
router.post('/submit', auth, async (req, res) => {
  try {

    const { examId, answers } = req.body;

    const questions = await Question.find({ examId });

    let score = 0;
    let totalMarks = 0;

    const evaluatedAnswers = answers.map(ans => {
      const q = questions.find(q => q._id.toString() === ans.questionId);

      let isCorrect = false;

      if (q) {
        totalMarks += q.marks || 1;

        if (q.answer === ans.selectedOption) {
          score += q.marks || 1;
          isCorrect = true;
        } else {
          score -= q.negativeMarks || 0;
        }
      }

      return {
        questionId: ans.questionId,
        selectedOption: ans.selectedOption,
        isCorrect
      };
    });

    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;

    await Result.create({
      userId: req.user.id,
      examId,
      answers: evaluatedAnswers,
      score,
      totalMarks,
      percentage
    });

    res.json({
      msg: 'Exam submitted',
      score,
      totalMarks,
      percentage
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Error submitting exam' });
  }
});

module.exports = router;