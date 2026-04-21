const express = require("express");
const router = express.Router();
const axios = require("axios");

const Exam = require("../models/Exam");

// ✅ GENERATE PAPER + SAVE
router.post("/generate-paper", async (req, res) => {
  try {
    const { examId, examinerId, subject, manualQuestions } = req.body;

    // 🔍 VALIDATION
    if (!examId || !examinerId || !subject) {
      return res.status(400).json({
        error: "examId, examinerId, subject required ❌"
      });
    }

    console.log("📥 REQUEST:", { examId, examinerId, subject });

    // 🔥 1. CALL AI
    const aiRes = await axios.post(
      "http://localhost:5000/api/ai/generate",
      { subject }
    );

    let paper = aiRes.data;

    // ================= REPLACE AI QUESTIONS WITH ADMIN =================

if (manualQuestions && manualQuestions.length > 0) {

  // 🔹 Separate by marks
  let manualPartA = manualQuestions.filter(q => q.marks == 5);
  let manualPartB = manualQuestions.filter(q => q.marks == 10);

  // 🔹 Safety (avoid overflow)
  manualPartA = manualPartA.slice(0, paper.partA.questions.length);
  manualPartB = manualPartB.slice(0, paper.partB.questions.length);

  // 🔹 Replace Part A (5 marks)
  manualPartA.forEach((mq, i) => {
    paper.partA.questions[i] = mq;
  });

  // 🔹 Replace Part B (10 marks)
  manualPartB.forEach((mq, i) => {
    paper.partB.questions[i] = mq;
  });
}

    console.log("📄 GENERATED PAPER:", paper);

// 🔥 SAVE TO DB
const exam = await Exam.findById(examId);

if (!exam) {
  return res.status(404).json({ error: "Exam not found ❌" });
}

// ✅ FORCE SAVE
exam.generatedPaper = paper;
exam.assignedExaminers = [examinerId];
exam.status = "generated";

await exam.save();

// 🔥 VERIFY SAVE
console.log("✅ SAVED IN DB:", exam.generatedPaper);

    // ✅ RESPONSE (VERY IMPORTANT)
    res.json({
      success: true,
      msg: "Paper generated & saved successfully",
      paper: exam.generatedPaper
    });

  } catch (err) {
    console.log("❌ GENERATE ERROR:", err);
    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;