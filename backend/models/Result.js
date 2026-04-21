const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },

  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
      },
      selectedOption: String,
      isCorrect: Boolean
    }
  ],

  score: {
    type: Number,
    default: 0
  },

  totalMarks: {
    type: Number,
    default: 0
  },

  percentage: {
    type: Number,
    default: 0
  },

  submittedAt: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

module.exports = mongoose.model('Result', schema);