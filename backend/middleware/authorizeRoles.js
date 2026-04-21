const authorizeRoles = (...roles) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Access Denied" });
    }

    next();
  };
};

router.post("/publish-exam/:id", authorizeRoles("examiner"), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ msg: "Exam not found" });
    }

    exam.status = "published";
    await exam.save();

    res.json({ msg: "Exam published successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/publish-exam/:id", authorizeRoles("examiner"), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ msg: "Exam not found" });
    }

    if (exam.assignedExaminer.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized for this exam" });
    }

    exam.status = "published";
    await exam.save();

    res.json({ msg: "Exam published successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function evaluateAnswer(studentAnswer, keywords, maxMarks) {
  if (!studentAnswer) return 0;

  let score = 0;
  const answer = studentAnswer.toLowerCase();

  keywords.forEach(keyword => {
    if (answer.includes(keyword.toLowerCase())) {
      score += maxMarks / keywords.length;
    }
  });

  // Bonus for length (optional)
  const wordCount = answer.split(" ").length;
  if (wordCount > 100) score += 1;

  return Math.min(Math.round(score), maxMarks);
}

const cosineSimilarity = (vecA, vecB) => {
  let dot = 0, magA = 0, magB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] ** 2;
    magB += vecB[i] ** 2;
  }

  if (magA === 0 || magB === 0) return 0;

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};