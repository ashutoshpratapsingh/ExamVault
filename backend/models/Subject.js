const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: String,
  units: [
    {
      unitName: String,
      topics: [String]
    }
  ]
});

module.exports = mongoose.model("Subject", subjectSchema);