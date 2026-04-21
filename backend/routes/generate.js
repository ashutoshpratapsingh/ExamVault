const { spawn } = require("child_process");

router.post("/generate", (req, res) => {
  console.log("📥 BODY:", req.body);
  const { subject, difficulty, count } = req.body;

  console.log("🔥 API HIT");

  const python = spawn("python", ["ai_engine.py", subject, difficulty, count]);

  let data = "";
  let error = "";

  python.stdout.on("data", (chunk) => {
    console.log("🐍 OUTPUT:", chunk.toString());
    data += chunk.toString();
  });

  python.stderr.on("data", (chunk) => {
    console.log("🐍 ERROR:", chunk.toString());
    error += chunk.toString();
  });

  python.on("close", () => {
    console.log("🐍 PROCESS CLOSED");

    if (error) {
      return res.status(500).json({ error });
    }

    if (!data) {
      return res.status(500).json({ error: "No output from Python" });
    }

    try {
      const parsed = JSON.parse(data);
      return res.json({ success: true, data: parsed });
    } catch (e) {
      console.log("❌ JSON PARSE ERROR:", e);
      return res.status(500).json({ error: "Invalid JSON" });
    }
  });
});