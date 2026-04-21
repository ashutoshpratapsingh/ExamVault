const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  paper: [
    {
      question: String,
      marks: Number,
      keywords: [String]
    }
  ],

  status: {
    type: String,
    enum: ["draft", "distributed", "started", "evaluated"],
    default: "draft"
  },

  subject: {
    type: String
  },

  duration: {
    type: String,
    default: 180
  },

  totalMarks: {
    type: Number,
    default: 70
  },

  questions: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }
],

examinerIds: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
],

  assignedExaminers: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
],

generatedPaper: {
  partA: {
    instruction: String,
    questions: [
      {
        question: String,
        marks: Number
      }
    ]
  },
  partB: {
    instruction: String,
    questions: [
      {
        question: String,
        marks: Number
      }
    ]
  }
},

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  status: {
    type: String,
    default: "draft"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }, 

  isPublished: {
  type: Boolean,
  default: false
},

  isDeleted: {
  type: Boolean,
  default: false
},

isAttempted: {
  type: Boolean,
  default: false
},

startTime: Date,
endTime: Date
});

module.exports = mongoose.model("Exam", examSchema);