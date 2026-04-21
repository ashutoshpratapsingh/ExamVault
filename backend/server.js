const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ===== MIDDLEWARE =====
app.use(cors()); // ✅ simple & working
app.use(express.json());

// ===== DEBUG LOGGER =====
app.use((req, res, next) => {
  console.log("🌐 REQUEST HIT:", req.method, req.url);
  next();
});

// ===== ROUTES =====
app.use("/api/auth", require("./routes/auth"));
app.use("/api/questions", require("./routes/questions"));
app.use("/api/result", require("./routes/result"));
app.use("/api/exam", require("./routes/exam"));   // ✅ ONLY ONCE
app.use("/api/monitor", require("./routes/monitor"));
app.use("/api/evaluate", require("./routes/evaluate"));
app.use("/api/student", require("./routes/student"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/examiner", require("./routes/examiner"));

// ===== TEST ROUTE (KEEP THIS) =====
app.get("/api/test-exams", async (req, res) => {
  try {
    const Exam = require("./models/Exam");

    const exams = await Exam.find({
      isPublished: true   // ✅ ONLY published exams
    });

    console.log("🔥 FILTERED EXAMS:", exams.length);

    res.json(exams);
  } catch (err) {
    console.log("❌ ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===== ROOT =====
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

// ===== DB CONNECT =====
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.log("❌ DB Error:", err));