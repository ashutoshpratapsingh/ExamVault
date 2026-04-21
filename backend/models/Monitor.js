const mongoose = require('mongoose');

const MonitorSchema = new mongoose.Schema({
  studentId: String,
  name: String,
  rollNo: String,   // ✅ ADD THIS LINE
  examId: String,
  violations: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Monitor', MonitorSchema);