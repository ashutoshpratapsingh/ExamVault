const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");

router.get("/report/:id", async (req, res) => {
  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");

  doc.pipe(res);

  doc.text("Exam Report", { align: "center" });
  doc.text("Student Performance");

  doc.end();
});

module.exports = router;