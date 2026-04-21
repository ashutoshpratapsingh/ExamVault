const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['admin', 'student', 'examiner'],
    default: 'student'
  },

  rollNumber: {
  type: String,
  required: true
},

  canManageQuestion: {
  type: Boolean,
  default: false
},
canReleaseExam: {
  type: Boolean,
  default: false
},
course: String,
rollNo: String,
sessionYear: String,
phone: String

}, { timestamps: true });


// ✅ NO next() → FIXED
schema.pre('save', async function() {

  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

});


// ================= COMPARE PASSWORD =================
schema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};


module.exports = mongoose.model('User', schema);