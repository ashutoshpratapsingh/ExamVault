const mongoose = require("mongoose");

// ✅ CLEAN CONNECT (NO OPTIONS)
mongoose.connect("mongodb://127.0.0.1:27017/EXAM");

const subjectSchema = new mongoose.Schema({
  name: String,
  units: [
    {
      unitName: String,
      topics: [String],
    },
   ]
  });

const Subject = mongoose.model("Subject", subjectSchema);

const subjects = [

  // ================= CORE =================
  {
    name: "DBMS",
    units: [
      { unitName: "Unit 1", topics: ["DBMS basics", "data models"] },
      { unitName: "Unit 2", topics: ["ER model", "relationships"] },
      { unitName: "Unit 3", topics: ["Normalization", "1NF", "2NF"] },
      { unitName: "Unit 4", topics: ["SQL", "joins"] },
      { unitName: "Unit 5", topics: ["Transactions", "ACID"] }
    ]
  },

  {
    name: "OS",
    units: [
      { unitName: "Unit 1", topics: ["OS basics", "types"] },
      { unitName: "Unit 2", topics: ["Process", "scheduling"] },
      { unitName: "Unit 3", topics: ["Deadlock"] },
      { unitName: "Unit 4", topics: ["Memory", "paging"] },
      { unitName: "Unit 5", topics: ["File system"] }
    ]
  },

  {
    name: "CN",
    units: [
      { unitName: "Unit 1", topics: ["OSI model", "TCP/IP"] },
      { unitName: "Unit 2", topics: ["Data link layer"] },
      { unitName: "Unit 3", topics: ["Routing"] },
      { unitName: "Unit 4", topics: ["TCP", "UDP"] },
      { unitName: "Unit 5", topics: ["HTTP", "DNS"] }
    ]
  },

  {
    name: "DSA",
    units: [
      { unitName: "Unit 1", topics: ["Arrays", "Linked list"] },
      { unitName: "Unit 2", topics: ["Stack", "Queue"] },
      { unitName: "Unit 3", topics: ["Trees", "BST"] },
      { unitName: "Unit 4", topics: ["Graphs"] },
      { unitName: "Unit 5", topics: ["Sorting"] }
    ]
  },

  {
    name: "TOC",
    units: [
      { unitName: "Unit 1", topics: ["Automata"] },
      { unitName: "Unit 2", topics: ["Regular expressions"] },
      { unitName: "Unit 3", topics: ["CFG"] },
      { unitName: "Unit 4", topics: ["Turing machine"] },
      { unitName: "Unit 5", topics: ["Decidability"] }
    ]
  },

  {
    name: "Compiler Design",
    units: [
      { unitName: "Unit 1", topics: ["Lexical analysis"] },
      { unitName: "Unit 2", topics: ["Parsing"] },
      { unitName: "Unit 3", topics: ["Syntax"] },
      { unitName: "Unit 4", topics: ["Optimization"] },
      { unitName: "Unit 5", topics: ["Code generation"] }
    ]
  },

  // ================= ADVANCED =================

  {
    name: "AI",
    units: [
      { unitName: "Unit 1", topics: ["AI basics"] },
      { unitName: "Unit 2", topics: ["Search algorithms"] },
      { unitName: "Unit 3", topics: ["Knowledge representation"] },
      { unitName: "Unit 4", topics: ["Machine learning"] },
      { unitName: "Unit 5", topics: ["Neural networks"] }
    ]
  },

  {
    name: "ML",
    units: [
      { unitName: "Unit 1", topics: ["Classification"] },
      { unitName: "Unit 2", topics: ["Regression"] },
      { unitName: "Unit 3", topics: ["Clustering"] },
      { unitName: "Unit 4", topics: ["Evaluation"] },
      { unitName: "Unit 5", topics: ["Applications"] }
    ]
  },

  {
    name: "Cloud Computing",
    units: [
      { unitName: "Unit 1", topics: ["IaaS", "PaaS"] },
      { unitName: "Unit 2", topics: ["Virtualization"] },
      { unitName: "Unit 3", topics: ["Cloud models"] },
      { unitName: "Unit 4", topics: ["Security"] },
      { unitName: "Unit 5", topics: ["AWS"] }
    ]
  },

  {
    name: "Cyber Security",
    units: [
      { unitName: "Unit 1", topics: ["CIA triad"] },
      { unitName: "Unit 2", topics: ["Cryptography"] },
      { unitName: "Unit 3", topics: ["Network security"] },
      { unitName: "Unit 4", topics: ["Web security"] },
      { unitName: "Unit 5", topics: ["Ethical hacking"] }
    ]
  },

  // ================= MCA =================

  {
    name: "Software Engineering",
    units: [
      { unitName: "Unit 1", topics: ["SDLC"] },
      { unitName: "Unit 2", topics: ["Agile"] },
      { unitName: "Unit 3", topics: ["Requirements"] },
      { unitName: "Unit 4", topics: ["Design"] },
      { unitName: "Unit 5", topics: ["Testing"] }
    ]
  },

  {
    name: "Web Technology",
    units: [
      { unitName: "Unit 1", topics: ["HTML", "CSS"] },
      { unitName: "Unit 2", topics: ["JavaScript"] },
      { unitName: "Unit 3", topics: ["Node.js"] },
      { unitName: "Unit 4", topics: ["MongoDB"] },
      { unitName: "Unit 5", topics: ["APIs"] }
    ]
  }

];

async function seed() {
  try {
    await Subject.deleteMany();
    await Subject.insertMany(subjects);

    console.log("✅ DATA INSERTED SUCCESSFULLY");
    process.exit();

  } catch (err) {
    console.error("❌ ERROR:", err);
    process.exit(1);
  }
}

seed();
