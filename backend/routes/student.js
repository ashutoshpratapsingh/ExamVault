const express = require("express");
const router = express.Router();
const multer = require('multer');

const axios = require("axios");
const Question = require("../models/Question");
const Subject = require("../models/Subject"); // ✅ FIXED NAME
const Exam = require("../models/Exam");
const { decrypt } = require("../utils/encryption");

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });


// ================= GET EXAM =================
router.get("/exam/:id", async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const questions = exam.encryptedQuestions
      ? decrypt(exam.encryptedQuestions)
      : exam.questions || [];

    res.json({
      questions: questions || [],
      duration: exam.duration
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// ================= AI HELPERS =================

// Semantic score
async function getSemanticScore(studentAnswer, modelAnswer) {
  try {
    const res = await axios.post("http://localhost:5001/similarity", {
      text1: studentAnswer,
      text2: modelAnswer
    });

    return res.data.similarity;
  } catch (err) {
    console.error("AI error:", err.message);
    return 0;
  }
}

// Keyword match
function keywordScore(answer, keywords) {
  let text = answer.toLowerCase();
  let matched = 0;

  keywords.forEach(k => {
    if (text.includes(k.toLowerCase())) matched++;
  });

  return keywords.length ? matched / keywords.length : 0;
}

// Structure detection
function structureScore(answer) {
  let score = 0;

  if (answer.includes("\n")) score += 0.3;
  if (answer.match(/\d+\./)) score += 0.3;
  if (answer.length > 100) score += 0.4;

  return Math.min(score, 1);
}

// Example detection
function exampleScore(answer) {
  const words = ["example", "for instance", "such as"];
  return words.some(w => answer.toLowerCase().includes(w)) ? 1 : 0;
}

// Diagram scoring
function diagramScore(question, files) {
  if (!files || files.length === 0) return 0;

  let score = 0;
  score += 0.5;

  const fileName = files[0].originalname.toLowerCase();

  if (question.diagramType === "ER" && fileName.includes("er")) score += 0.5;
  if (question.diagramType === "dfa" && fileName.includes("dfa")) score += 0.5;
  if (question.diagramType === "flowchart" && fileName.includes("flow")) score += 0.5;

  return Math.min(score, 1);
}

// Feedback
function generateFeedback(answer, marks, maxMarks) {
  let percent = (marks / maxMarks) * 100;

  if (percent > 80) return "Excellent answer with strong concept clarity.";
  if (percent > 60) return "Good answer, but lacks depth or examples.";
  if (percent > 40) return "Basic understanding shown, improve explanation.";

  return "Answer is weak, missing key concepts.";
}


// ================= SUBMIT =================
router.post("/submit", upload.array("diagrams"), async (req, res) => {
  try {
    const { examId } = req.body;
    const answers = JSON.parse(req.body.answers);

    let evaluatedAnswers = [];

    for (let qId in answers) {

      const studentAnswer = answers[qId];
      const question = await Question.findById(qId);

      const subjectName = question.subject || "GENERAL";

      const Submission = require("../models/Submission");
      
      const parsedAnswers = JSON.parse(req.body.answers || "[]");

      const answersWithMarks = parsedAnswers.map(a => ({
      questionId: a.questionId,
      answer: a.answer,
      marks: 5   // 🔥 ADD THIS
    }));

    const submission = new Submission({
    studentId: req.user?.id,
    examId: req.body.examId,
    answers: answersWithMarks,
    diagrams: req.files || []
  });


    await submission.save();

    res.json({ msg: "Submission saved ✅" });


      console.log("SUBJECT VALUE:", subjectName);

      // 🔹 Fetch subject rules from DB
      let rules = await Subject.findOne({
        name: subjectName.toUpperCase()
      });

      if (!rules) {
        rules = {
          keywordsWeight: 0.4,
          semanticWeight: 0.3,
          structureWeight: 0.2,
          exampleWeight: 0.1,
          diagramWeight: 0.2
        };
      }

      // 🔹 Scores
      let kScore = keywordScore(studentAnswer, question.keywords || []);
      let semanticScore = await getSemanticScore(
        studentAnswer,
        question.modelAnswer || ""
      );
      let sScore = structureScore(studentAnswer);
      let eScore = exampleScore(studentAnswer);
      let dScore = diagramScore(question, req.files);

      // 🔥 Length logic
      let wordCount = studentAnswer.split(" ").length;
      let expectedLength = question.marks === 10 ? 120 : 50;
      let lengthScore = Math.min(wordCount / expectedLength, 1);

      // 🔥 Final scoring
      let finalScore =
        (rules.keywordsWeight * kScore) +
        (rules.semanticWeight * semanticScore) +
        (rules.structureWeight * sScore) +
        (rules.exampleWeight * eScore) +
        (rules.diagramWeight * dScore);

      // 🔥 Length importance for 10 marks
      if (question.marks === 10) {
        finalScore += 0.2 * lengthScore;
      }

      let marks = Math.round(finalScore * question.marks);
      marks = Math.min(marks, question.marks);

      let feedback = generateFeedback(studentAnswer, marks, question.marks);

      evaluatedAnswers.push({
        questionId: qId,
        answer: studentAnswer,
        marksAwarded: marks,
        maxMarks: question.marks,
        keywordScore: kScore,
        semanticScore: semanticScore,
        structureScore: sScore,
        exampleScore: eScore,
        diagramScore: dScore,
        feedback
      });
    }

    // 🔹 Weak topics
    let weakTopics = {};

    for (let ans of evaluatedAnswers) {
      if (ans.marksAwarded < 5) {
        let topic = "general";
        weakTopics[topic] = (weakTopics[topic] || 0) + 1;
      }
    }

    res.json({
      message: "Evaluation complete",
      results: evaluatedAnswers,
      weakTopics
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Evaluation error" });
  }
});

router.get("/result/:examId", async (req, res) => {
  const sub = await Submission.findOne({
    examId: req.params.examId,
    studentId: req.user.id
  });

  if (!sub || sub.status !== "published") {
    return res.status(403).json({ msg: "Not published yet" });
  }

  res.json(sub);
});

module.exports = router;