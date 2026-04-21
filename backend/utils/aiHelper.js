const natural = require("natural");
const tokenizer = new natural.WordTokenizer();
const stopwords = require("stopword").removeStopwords;

const { generateKeywords } = require("../utils/aiHelper");

const keywords = generateKeywords(modelAnswer);

function generateKeywords(modelAnswer) {
  let tokens = tokenizer.tokenize(modelAnswer.toLowerCase());

  let filtered = stopwords(tokens);

  // pick unique important words
  let keywords = [...new Set(filtered)].slice(0, 10);

  return keywords;
}

module.exports = { generateKeywords };