const express = require("express");
const router = require("express").Router();
const Submission = require("../models/Submission");
const Exam = require("../models/Exam");
const auth = require("../middleware/auth");
const axios = require("axios");

// Get assigned exams
router.get("/assigned", auth, async (req, res) => {
  try {
    const exams = await Exam.find({
      assignedExaminers: req.user.id,
    });

    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 GET ALL SUBMISSIONS
router.get("/submissions/:examId", async (req, res) => {
  try {
    const submissions = await Submission.find({
      examId: req.params.examId
    }).populate("studentId", "name rollNo");

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching submissions" });
  }
});

// 🔹 EVALUATE
router.put("/evaluate/:id", async (req, res) => {
  try {
    const { manualMarks } = req.body;

    const sub = await Submission.findById(req.params.id);

    // 🔥 CALL AI EVALUATION HERE
    const aiRes = await axios.post("http://localhost:5000/api/ai-evaluate", {
      answers: sub.answers
    });

    const aiMarks = aiRes.data.totalMarks || 0;

    sub.manualMarks = manualMarks || 0;
    sub.aiMarks = aiMarks;
    sub.totalMarks = sub.manualMarks + sub.aiMarks;
    sub.status = "evaluated";

    await sub.save();

    res.json({ msg: "Marks saved with AI ✅" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Evaluation failed ❌" });
  }
});

// ✅ SAVE MARKS
router.put("/marks/:id", async (req, res) => {
  try {
    const { aiMarks, manualMarks, totalMarks } = req.body;

    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ msg: "Submission not found ❌" });
    }

    submission.aiMarks = aiMarks;

    // 👇 examiner final decision
    submission.totalMarks = manualMarks;

    await submission.save();

    res.json({ msg: "Marks updated ✅" });

  } catch (err) {
    console.log("MARK SAVE ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
});

// 🔹 PUBLISH RESULT
router.put("/publish/:examId", async (req, res) => {
  try {
    await Submission.updateMany(
      { examId: req.params.examId },
      { status: "published" }
    );

    res.json({ msg: "Results published ✅" });
  } catch (err) {
    res.status(500).json({ msg: "Publish failed ❌" });
  }
});

router.put("/delete-answer/:id", async (req, res) => {
  const { index } = req.body;

  const sub = await Submission.findById(req.params.id);

  sub.answers.splice(index, 1);

  await sub.save();

  res.json({ msg: "Answer deleted ✅" });
});

router.delete("/submission/:id", async (req, res) => {
  await Submission.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted ✅" });
});

module.exports = router;