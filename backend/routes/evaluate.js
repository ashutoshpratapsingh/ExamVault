const express = require("express");
const router = express.Router();

const natural = require("natural");
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

const axios = require("axios");

// ✅ Keyword Matching Function
function keywordScore(studentAnswer, keywords) {
  let tokens = tokenizer.tokenize(studentAnswer.toLowerCase());
  let stemmedAnswer = tokens.map(word => stemmer.stem(word));

  let matched = 0;

  keywords.forEach(keyword => {
    let keywordTokens = tokenizer.tokenize(keyword.toLowerCase());
    let stemmedKeyword = keywordTokens.map(word => stemmer.stem(word));

    let isMatch = stemmedKeyword.every(kw =>
      stemmedAnswer.includes(kw)
    );

    if (isMatch) matched++;
  });

  return matched / keywords.length;
}

const cosineSimilarity = require("cosine-similarity");

// Convert text → word frequency vector
function textToVector(text) {
  let words = text.toLowerCase().split(" ");
  let freq = {};

  words.forEach(word => {
    freq[word] = (freq[word] || 0) + 1;
  });

  return freq;
}

// Calculate similarity
function calculateSimilarity(ans1, ans2) {
  const vec1 = textToVector(ans1);
  const vec2 = textToVector(ans2);

  return cosineSimilarity(
    Object.values(vec1),
    Object.values(vec2)
  );
}

function generateFeedback(studentAnswer, keywords) {
  let answer = studentAnswer.toLowerCase();
  let missing = [];

  keywords.forEach(keyword => {
    if (!answer.includes(keyword.toLowerCase())) {
      missing.push(keyword);
    }
  });

  if (missing.length === 0) {
    return "Excellent answer! All key points are covered.";
  }

  if (missing.length < 3) {
    return `Good answer, but you missed: ${missing.join(", ")}`;
  }

  return "Answer is partially correct. Try to include more key concepts.";
}

async function getSemanticScore(studentAnswer, modelAnswer) {
  try {
    const res = await axios.post("http://localhost:5001/similarity", {
      text1: studentAnswer,
      text2: modelAnswer
    });

    return res.data.similarity;
  } catch (err) {
    console.error("AI Error:", err.message);
    return 0;
  }
}

router.post("/", async (req, res) => {
  const { studentAnswer } = req.body;

  const keywords = [
    "seven layers",
    "physical layer",
    "data link layer",
    "network layer",
    "transport layer",
    "session layer",
    "presentation layer",
    "application layer"
  ];

  const modelAnswer = `
  OSI model has seven layers:
  Physical, Data Link, Network, Transport,
  Session, Presentation, Application
  `;

  const totalMarks = 10;

  let kScore = keywordScore(studentAnswer, keywords);

  let semanticScore = await getSemanticScore(studentAnswer, modelAnswer);

  let finalScore = (0.5 * kScore) + (0.5 * semanticScore);

  let marks = Math.round(finalScore * totalMarks);

  let feedback = generateFeedback(studentAnswer, keywords);

  res.json({
    keywordScore: kScore,
    semanticScore: semanticScore,
    marksAwarded: marks,
    feedback: feedback
  });
});

router.post("/ai-evaluate", async (req, res) => {
  try {
    const { answers } = req.body;

    // 🔥 Simple AI logic (you can replace with real LLM later)
    let score = 0;

    answers.forEach(ans => {
      if (ans.answer && ans.answer.length > 20) {
        score += 5; // basic scoring
      }
    });

    res.json({ aiMarks: score });

  } catch (err) {
    res.status(500).json({ msg: "AI evaluation failed" });
  }
});

module.exports = router;