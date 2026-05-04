const express = require("express");
const mongoose = require('mongoose');
const router = require('express').Router();
const Exam = require("../models/Exam");
const Question = require("../models/Question");
const Submission = require("../models/Submission");
const auth = require("../middleware/auth");
const PDFDocument = require("pdfkit");

console.log("🔥 EXAM ROUTE FILE LOADED");

// ================= CREATE EXAM =================
router.post("/create", async (req, res) => {
  try {
    console.log("BODY:", req.body); // 🔥 DEBUG

    console.log("🔥 MY-EXAMS ROUTE HIT");

    const { title, duration } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const exam = new Exam({
      title,
      duration: duration || 180,
      totalMarks: 70,
      questions: []
    });

    await exam.save();

    res.json({ msg: "Exam created successfully", exam });

  } catch (err) {
    console.error("ERROR:", err); // 🔥 VERY IMPORTANT
    res.status(500).json({ error: err.message });
  }
});

// ================= GET ALL EXAMS =================

router.get('/', async (req, res) => {
  try {
    const { search, category, difficulty } = req.query;

    let filter = {};

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    if (category) {
      filter.category = category;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

  const exams = await Exam.find({
  ...filter,
  }).sort({ createdAt: -1 });

  console.log("📚 STUDENT EXAMS:", exams);

  res.json(exams);

  } catch (err) {
    res.status(500).json({ msg: 'Error fetching exams' });
  }
});

// Admin (all exams)
router.get("/admin", async (req, res) => {
  const exams = await Exam.find();
  res.json(exams);
});

// Student (filtered)
router.get("/", async (req, res) => {
  const exams = await Exam.find({
    status: { $in: ["distributed", "started"] }
  });
  res.json(exams);
});

// ================= DELETE EXAM =================

router.get("/my-exams", auth, async (req, res) => {
  try {

    // 🔥 SAFETY CHECK
    if (!req.user || !req.user.id) {
      console.log("❌ USER NOT FOUND IN REQUEST");
      return res.status(401).json({ error: "User not authenticated" });
    }

    console.log("👤 USER ID:", req.user.id);

    const exams = await Exam.find({
      isPublished: true
    });

    const filtered = exams.filter(exam =>
      exam.assignedExaminers?.some(
        ex => ex.toString() === req.user.id
      )
    );

    console.log("📚 FILTERED EXAMS:", filtered.length);

    res.json(filtered);

  } catch (err) {
    console.log("🔥 REAL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/paper/:id", async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).lean();

    console.log("📄 DB EXAM:", exam);

    if (!exam) {
      return res.status(404).json({
        msg: "Exam not found ❌"
      });
    }

    // 🔥 FORCE CHECK
    if (!exam.generatedPaper) {
  return res.status(404).json({
    msg: "No paper generated ❌"
  });
}

    // ✅ RETURN PAPER
res.json({
  title: exam.title,
  duration: exam.duration,
  totalMarks: exam.totalMarks,
  generatedPaper: exam.generatedPaper
});

  } catch (err) {
    console.log("❌ PAPER ERROR:", err);
    res.status(500).json({
      msg: "Error fetching paper"
    });
  }
});

router.put("/publish/:id", auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ msg: "Exam not found" });
    }

    // ❌ BLOCK EMPTY PAPER
    const hasPaper =
      (exam.generatedPaper?.partA?.questions?.length || 0) > 0 ||
      (exam.generatedPaper?.partB?.questions?.length || 0) > 0;

    if (!hasPaper) {
      return res.status(400).json({
        msg: "❌ Generate paper before publishing"
      });
    }

    exam.isPublished = true;
    exam.status = "published";

    await exam.save();

    res.json({ msg: "✅ Exam published successfully" });

  } catch (err) {
    console.log("❌ PUBLISH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/distribute/:id", async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ msg: "Exam not found" });
    }

    exam.status = "distributed"; // students can attempt
    await exam.save();

    res.json({ msg: "Exam distributed to students" });

  } catch (err) {
    console.log("❌ DISTRIBUTE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/start/:id", auth, async (req, res) => {
  try {
    console.log("USER:", req.user);

    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ msg: "Exam not found ❌" });
    }

    exam.status = "started";
    exam.startedBy = req.user.id; // optional

    await exam.save();

    res.json({ msg: "Exam started ✅" });

  } catch (err) {
    console.log("START ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
});

router.put("/save-generated-paper/:id", async (req, res) => {
  try {
    const { paper, examinerId } = req.body;

    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ msg: "Exam not found ❌" });
    }

    exam.generatedPaper = {
    partA: {
    instruction:
      paper.partA?.instruction || "Attempt any 6 questions",
    questions: paper.partA?.questions || []
   },
   partB: {
    instruction:
      paper.partB?.instruction || "Attempt any 4 questions",
    questions: paper.partB?.questions || []
  }
 }; // { partA, partB }
    if (examinerId) {
      exam.assignedExaminers = [examinerId];
    }
    exam.status = "generated";

    await exam.save();

    console.log("✅ PAPER SAVED (patch route)");
    res.json({ success: true });

  } catch (err) {
    console.log("❌ SAVE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam || exam.isDeleted) {
      return res.status(404).json({
        msg: "Exam not available ❌"
      });
    }

    res.json(exam);

  } catch (err) {
    res.status(500).json({ msg: 'Error fetching exam' });
  }
});

router.put("/assign/:id", async (req, res) => {
  try {
    const { examinerIds } = req.body;

    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { assignedExaminers: examinerIds },
      { new: true }
    );

    res.json(exam);

  } catch (err) {
    res.status(500).json({ error: "Assignment failed ❌" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ msg: "Exam not found ❌" });
    }

    // 🔥 OPTIONAL: allow delete even after attempt
    // REMOVE this if exists:
    // if (exam.attemptedBy.length > 0) return error;

    await exam.deleteOne();

    res.json({ msg: "Exam deleted successfully ✅" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Delete failed ❌" });
  }
});

router.post("/submit", auth, async (req, res) => {
  try {
    const { examId, answers } = req.body;

    if (!examId || !answers) {
      return res.status(400).json({ msg: "Missing data ❌" });
    }

    let evaluatedAnswers = [];

for (let a of answers) {
  const studentAnswer = a.answer || "";
  const questionId = a.questionId;

  // ✅ MARKING LOGIC
  let marks = studentAnswer.length > 20 ? 8 : 4;

  // ✅ FEEDBACK (THIS WAS MISSING OR WRONG)
  let feedback = "";

  if (marks >= 8) {
    feedback = "Good answer";
  } else {
    feedback = "Needs improvement";
  }

  // ✅ PUSH WITH FEEDBACK
  evaluatedAnswers.push({
    questionId,
    answer: studentAnswer,
    marksAwarded: marks,
    feedback   // 🔥 MUST BE HERE
  });
}

    // ✅ SAVE AFTER LOOP
    const submission = new Submission({
      studentId: req.user.id,
      examId,
      answers: evaluatedAnswers
    });

    await submission.save();

    res.json({
      message: "Evaluation complete",
      answers: evaluatedAnswers
    });

  } catch (err) {
    console.log("SUBMIT ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
});

router.post("/download-paper", (req, res) => {
  try {
    const { paper } = req.body;

    const doc = new PDFDocument({
      margin: 50
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=QuestionPaper.pdf"
    );

    doc.pipe(res);

    // ================= HEADER =================
    doc.font("Helvetica-Bold")
       .fontSize(16)
       .text("Dayananda Sagar College of Arts, Science and Commerce", {
         align: "center"
       });

    doc.moveDown(0.3);

    doc.font("Helvetica")
       .fontSize(12)
       .text("KS Layout, Bangalore – 560111", {
         align: "center"
       });

    doc.moveDown(1);

    // ================= TITLE =================
    doc.font("Helvetica-Bold")
       .fontSize(14)
       .text("QUESTION PAPER", { align: "center" });

    doc.moveDown(1);

    // ================= DETAILS =================
    doc.font("Helvetica")
       .fontSize(12)
       .text(`Subject: ${paper.title}`);

    doc.text(`Time: ${paper.duration || "3 Hours"}`);
    doc.text(`Maximum Marks: ${paper.totalMarks || 70}`);

    doc.moveDown(1);

    // ================= PART A =================
    doc.font("Helvetica-Bold")
   .text("Part A", { underline: true });

   doc.moveDown(0.3);

   doc.font("Helvetica-Oblique")
   .text(paper.generatedPaper.partA?.instruction || "Attempt any 6 questions");

   doc.moveDown(0.5); 

    paper.generatedPaper.partA?.questions?.forEach((q, i) => {
      doc.font("Helvetica")
         .text(`Q${i + 1}. ${q.question} (${q.marks} Marks)`);
      doc.moveDown(0.5);
    });

    // ================= PART B =================
    doc.moveDown();

    doc.font("Helvetica-Bold")
   .text("Part B", { underline: true });

   doc.moveDown(0.3);

   doc.font("Helvetica-Oblique")
   .text(paper.generatedPaper.partB?.instruction || "Attempt any 4 questions");

   doc.moveDown(0.5);

    paper.generatedPaper.partB?.questions?.forEach((q, i) => {
      doc.font("Helvetica")
         .text(`Q${i + 9}. ${q.question} (${q.marks} Marks)`);
      doc.moveDown(0.5);
    });

    // ================= FOOTER =================
    doc.moveDown(2);

    doc.fontSize(10)
       .font("Helvetica-Oblique")
       .text("This is a digitally generated question paper.", {
         align: "center"
       });

    doc.end();

  } catch (err) {
    console.log("PDF ERROR:", err);
    res.status(500).send("Error generating PDF");
  }
});

module.exports = router;