const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({

  // 🔗 Link to exam
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true
  },

  subject: {
    type: String,
    required: true
  },

  topic: {
    type: String,
    required: true
  },

  questionText: {
    type: String,
    required: true
  },

  diagramType: {
  type: String,
  enum: ["ER", "DFA", "FLOWCHART", "TREE", "NONE"],
  default: "NONE"
},

  type: {
    type: String,
    enum: ["mcq", "theory"],
    default: "theory"
  },

  options: {
    type: [String],
    default: []
  },

  answer: {
    type: String,
    default: ""
  },

  keywords: {
    type: [String],
    default: []
  },

  marks: {
    type: Number,
    default: 5
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("Question", QuestionSchema);