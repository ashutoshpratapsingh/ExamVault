const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");

// 🔀 Shuffle
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// 🎯 Templates
const shortTemplates = [
  "Define {topic}.",
  "What is {topic}?",
  "List key features of {topic}.",
  "Write a short note on {topic}.",
  "State advantages of {topic}.",
  "Differentiate {topic} with related concept."
];

const longTemplates = [
  "Explain {topic} in detail with examples.",
  "Discuss the working of {topic}.",
  "Elaborate {topic} with suitable diagram.",
  "Explain architecture of {topic}.",
  "Discuss advantages and limitations of {topic}.",
  "Explain real-world applications of {topic}."
];

// 🧠 DEFAULT TOPICS (NO DB NEEDED)
const defaultTopics = [
  "introduction",
  "architecture",
  "working",
  "design",
  "algorithms",
  "performance",
  "security",
  "applications",
  "advantages",
  "limitations"
];

// 🧠 MAIN AI FUNCTION
function generatePaper(subjectData) {

  let partA = [];
  let partB = [];

  const allTopics = subjectData.units.flatMap(u => u.topics);

  if (allTopics.length === 0) {
    throw new Error("No topics found ❌");
  }

  // 🔥 SHUFFLE TOPICS
  const shuffledTopics = [...allTopics].sort(() => 0.5 - Math.random());

  // 🔥 PART A (8 UNIQUE)
  for (let i = 0; i < 8; i++) {
    const topic = shuffledTopics[i % shuffledTopics.length];

    const template = shortTemplates[i % shortTemplates.length];

    const q = template.replace("{topic}", topic);

    partA.push({ question: q, marks: 5 });
  }

  // 🔥 PART B (6 UNIQUE)
  for (let i = 0; i < 6; i++) {
    const topic = shuffledTopics[(i + 5) % shuffledTopics.length];

    const template = longTemplates[i % longTemplates.length];

    const q = template.replace("{topic}", topic);

    partB.push({ question: q, marks: 10 });
  }

  return {
    partA: {
      instruction: "Attempt any 6 questions",
      questions: partA
    },
    partB: {
      instruction: "Attempt any 4 questions",
      questions: partB
    }
  };
}

router.post("/preview", async (req, res) => {
  console.log("🔥 PREVIEW API HIT"); // ADD THIS

  try {
    const { subject } = req.body;

    const subjectData = await Subject.findOne({
      name: { $regex: new RegExp("^" + subject + "$", "i") }
    });

    if (!subjectData) {
      return res.status(404).json({
        error: "Subject not found ❌"
      });
    }

    const allTopics = subjectData.units.flatMap(u => u.topics);

    console.log("📚 TOPICS:", allTopics);

    let previewQuestions = [];

    for (let i = 0; i < 10; i++) {
      const topic = allTopics[Math.floor(Math.random() * allTopics.length)];

      const q = shortTemplates[Math.floor(Math.random() * shortTemplates.length)]
        .replace("{topic}", topic);

      previewQuestions.push(q);
    }

    console.log("📤 PREVIEW:", previewQuestions);

    res.json(previewQuestions);

  } catch (err) {
    res.status(500).json({ error: "Preview failed ❌" });
  }
});

// 🚀 ROUTE
router.post("/generate", async (req, res) => {
  try {
    const { subject, examId, examinerId } = req.body;

    const Subject = require("../models/Subject");

    const subjectData = await Subject.findOne({
      name: { $regex: new RegExp("^" + subject + "$", "i") }
    });

    const subjectKeywords = subjectData
      ? subjectData.units.flatMap(u => u.topics)
      : [];

    if (!subjectData) {
      return res.status(404).json({
        error: "Subject not found ❌"
      });
    }

    const paper = generatePaper(subjectData);

    // ✅ AUTO SAVE
    if (examId) {
      const Exam = require("../models/Exam");

      const exam = await Exam.findById(examId);

      if (exam) {
        exam.generatedPaper = paper;

        if (examinerId) {
          exam.assignedExaminers = [examinerId];
        }

        exam.status = "generated";

        await exam.save();

        console.log("✅ PAPER SAVED FROM AI ROUTE");
      }
    }

    res.json(paper);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= AI EVALUATION =================

router.post("/evaluate", async (req, res) => {
  try {
    const { answers } = req.body;

    let totalMarks = 0;

  const results = answers.map((ans) => {
  const studentAnswer = ans.answer.toLowerCase();
  const questionText = ans.question.toLowerCase();
  const maxMarks = ans.marks || 5;

  // 🔹 QUESTION KEYWORDS
  const qKeywords = questionText
    .split(" ")
    .filter(w => w.length > 3);

  let qMatch = 0;
  qKeywords.forEach(w => {
    if (studentAnswer.includes(w)) qMatch++;
  });

  const qScore = qKeywords.length ? qMatch / qKeywords.length : 0;

  // 🔹 SUBJECT KEYWORDS
  let sMatch = 0;
  subjectKeywords.forEach(k => {
    if (studentAnswer.includes(k.toLowerCase())) sMatch++;
  });

  const sScore = subjectKeywords.length
    ? Math.min(sMatch / subjectKeywords.length, 1)
    : 0;

  // 🔹 LENGTH
  const words = studentAnswer.split(" ").length;
  const lScore = words > 120 ? 1 : words > 50 ? 0.6 : 0.3;

  // 🔹 STRUCTURE
  const sStruct =
    (studentAnswer.includes("\n") ? 0.3 : 0) +
    (studentAnswer.includes("-") ? 0.3 : 0) +
    (words > 40 ? 0.4 : 0);

  // 🔥 FINAL SCORE
  const finalScore =
    (0.3 * qScore) +
    (0.3 * sScore) +
    (0.2 * sStruct) +
    (0.2 * lScore);

  const marks = Math.round(finalScore * maxMarks);

  totalMarks += marks;

  return {
    questionId: ans.questionId,
    marks,
    feedback: {
      questionMatch: qScore,
      subjectDepth: sScore,
      structure: sStruct,
      length: lScore
    }
  };
});

    res.json({ totalMarks, results });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔥 SIMPLE AI EVALUATION LOGIC
router.post("/ai-evaluate", async (req, res) => {
  try {
    const { answers } = req.body;

    let totalMarks = 0;

    const results = answers.map((a) => {
      const maxMarks = a.marks || 5;

      let marks = 0;

      const answer = (a.answer || "").toString().trim().toLowerCase();

      if (answer.length > 20) {
        marks = Math.floor(maxMarks * 0.5);
      }

      if (answer.length > 50) {
        marks = Math.floor(maxMarks * 0.7);
      }

      if (answer.length > 100) {
        marks = maxMarks;
      }

      totalMarks += marks;

      return {
        questionId: a.questionId,
        marks
      };
    });

    res.json({ totalMarks, results });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "AI evaluation failed ❌" });
  }
});

module.exports = router;