const express = require('express');
const router = express.Router();
const Monitor = require('../models/Monitor');

// GET monitoring data
router.get("/:examId", async (req, res) => {
  try {
    const records = await Monitor.find({ examId: req.params.examId });

    const result = records.map(r => ({
      rollNo: r.rollNo || "UNKNOWN",
      name: r.name || "Unknown",
      violations: r.violations
    }));

    res.json(result);

  } catch (err) {
    console.error("Monitor Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// LOG violation
router.post('/log', async (req, res) => {
  try {
    const { studentId, name, rollNo, examId } = req.body;

    let record = await Monitor.findOne({ studentId: studentId, examId });

    if (!record) {
      record = new Monitor({
        studentId,
        name,
        rollNo,
        examId,
        violations: 1
      });
    } else {
      record.violations += 1;
    }

    await record.save();

    return res.json(record);

  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

module.exports = router;