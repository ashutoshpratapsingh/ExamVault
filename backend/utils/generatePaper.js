function generateSmartPaper(questions) {
  let paper = [];
  let totalMarks = 0;

  const usedTopics = new Set();

  const shuffled = questions.sort(() => 0.5 - Math.random());

  for (let q of shuffled) {

    const topic = q.keywords?.[1] || q.keywords?.[0] || "general";

    if (usedTopics.has(topic)) continue;

    if (totalMarks + q.marks <= 100) {

      paper.push({
        ...q,
        question: generateVariation(q.question),
      });

      usedTopics.add(topic);
      totalMarks += q.marks;
    }

    if (totalMarks >= 100) break;
  }

  return paper;
}

function generateVariation(text) {
  const variations = [
    text.replace("Explain", "Discuss"),
    text.replace("Explain", "Describe"),
    text.replace("Explain", "Analyze"),
    text.replace("What is", "Explain the concept of"),
    text.replace("Define", "Elaborate on"),
  ];

  return variations[Math.floor(Math.random() * variations.length)];
}