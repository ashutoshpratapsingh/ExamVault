const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
  examId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Exam"
},
  studentId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
},
  answers: [
    {
      questionId: String,
      answer: String,
      marksAwarded: Number,
      feedback: String
    }
  ],
  aiMarks: Number,
  manualMarks: Number,
  totalMarks: Number,
  status: {
    type: String,
    default: "pending"
  },
  submittedAt: Date
});

module.exports = mongoose.model("Submission", SubmissionSchema);