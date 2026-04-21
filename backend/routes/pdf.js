const router = require("express").Router();
const multer = require("multer");
const path = require("path");

// storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post("/upload", upload.single("file"), (req, res) => {
  try {

    // 🔍 DEBUG START
    console.log("HEADERS:", req.headers);
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    // 🔍 DEBUG END

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;

    res.json({
      message: "Upload successful",
      path: filePath
    });

  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;