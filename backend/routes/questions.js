const router = require('express').Router();
const Question = require('../models/Question');
const Exam = require('../models/Exam');
const auth = require('../middleware/auth');
const { spawn } = require("child_process");


// ================= ADD QUESTION =================
router.post('/add', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'examiner') {
      return res.status(403).json({ msg: 'Access Denied ❌' });
    }

    let { examId, question, type, options, answer, keywords, marks } = req.body;

    if (!type) type = "theory";

    if (type === "theory") {
      options = [];
      answer = "";
      keywords = keywords?.length ? keywords : ["AI"];
      marks = marks || 5;
    }

    if (type === "mcq") {
      options = options?.length >= 2 ? options : ["Option A", "Option B"];
      answer = answer || options[0];
    }

    const newQuestion = await Question.create({
      examId: req.body.examId,
      subject: subject || "General",
      topic: subject || "General",
      questionText: question,
      type,
      options,
      answer,
      keywords,
      marks,
      createdBy: req.user.id
    });

    await Exam.findByIdAndUpdate(examId, {
      $push: { questions: newQuestion._id },
      $inc: { totalQuestions: 1 }
    });

    res.json({ msg: 'Question Added ✅' });

  } catch (err) {
    console.log("SAVE ERROR:", err.message);
    res.status(500).json({ msg: err.message });
  }
});


// ================= GET QUESTIONS =================
router.get('/:examId', auth, async (req, res) => {
  try {
    const questions = await Question.find({
      examId: req.params.examId
    });

    res.json(questions);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});


// ================= AI EVALUATION =================
router.post('/evaluate', async (req, res) => {
  try {
    const { questionId, answer } = req.body;

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).send('Question not found');
    }

    if (question.type !== 'theory') {
      return res.status(400).send('Not a theory question');
    }

    const keywords = question.keywords || [];
    let matched = 0;

    keywords.forEach(k => {
      if (answer.toLowerCase().includes(k.toLowerCase())) {
        matched++;
      }
    });

    const score = keywords.length > 0
      ? (matched / keywords.length) * question.marks
      : 0;

    res.send({
      totalKeywords: keywords.length,
      matchedKeywords: matched,
      score: Math.round(score)
    });

  } catch (err) {
    console.log(err);
    res.status(500).send('Evaluation error');
  }
});


// ================= AI GENERATE =================
router.post('/generate', async (req, res) => {
  const { subject, difficulty, count, examId } = req.body;

  console.log("🔥 GENERATE ROUTE HIT");
  console.log("📥 BODY:", req.body);

  // ❗ MUST HAVE examId
  if (!examId) {
    return res.status(400).json({ error: "examId is required ❌" });
  }

  try {
    const python = spawn("python", ["ai_engine.py", subject, difficulty, count]);

    let data = "";
    let error = "";

    python.stdout.on("data", (chunk) => {
      console.log("🐍 OUTPUT:", chunk.toString());
      data += chunk.toString();
    });

    python.stderr.on("data", (chunk) => {
      console.log("🐍 ERROR:", chunk.toString());
      error += chunk.toString();
    });

    python.on("close", async () => {
      console.log("🐍 PROCESS CLOSED");

      if (error) {
        return res.status(500).json({ error });
      }

      if (!data) {
        return res.status(500).json({ error: "No output from AI" });
      }

      try {
        const parsed = JSON.parse(data);

        // ✅ SAVE QUESTIONS
        const mongoose = require("mongoose");

        console.log("✅ USING examId:", examId);

        const saved = await Question.insertMany(
        parsed.map(q => ({
        examId: examId,
        subject: req.body.subject,
        topic: q.keywords?.[1] || q.keywords?.[0] || "general",
        questionText: q.question,
        type: "theory",
        options: [],
        answer: "",
        keywords: q.keywords || ["AI"],
        marks: q.marks || 5
     }))
    );

      console.log("💾 SAVED QUESTIONS:", saved.map(q => ({
      id: q._id,
      examId: q.examId
      })));

        // ✅ UPDATE EXAM
        await Exam.findByIdAndUpdate(examId, {
          $push: { questions: { $each: saved.map(q => q._id) } },
          $inc: { totalQuestions: saved.length }
        });

        res.json({
          success: true,
          data: saved
        });

      } catch (e) {
        console.log("❌ JSON PARSE ERROR:", e);
        res.status(500).json({ error: "Invalid JSON from AI" });
      }
    });

  } catch (err) {
    console.log("❌ SERVER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;