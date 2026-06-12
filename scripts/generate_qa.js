// scripts/generate_qa.js
// Generate 100,000 Q&A pairs for Oyi chatbot and write to data/oyi_qa_100k.jsonl
// Each line is a JSON object: {question:string, answer:string, category:string}
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'oyi_qa_100k.jsonl');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, {recursive: true});
}

const writeStream = fs.createWriteStream(OUTPUT_FILE, {flags: 'w'});

const TOTAL_CATEGORIES = 100;
const QUESTIONS_PER_CATEGORY = 1000; // 100 * 1000 = 100,000

for (let catIdx = 1; catIdx <= TOTAL_CATEGORIES; catIdx++) {
  const category = `Category ${catIdx}`;
  for (let qIdx = 1; qIdx <= QUESTIONS_PER_CATEGORY; qIdx++) {
    const question = `${category} hakkında soru ${qIdx}`;
    const answer = `Oyi cevabı: ${category} sorusuna verilen yanıt ${qIdx}.`;
    const obj = {question, answer, category};
    writeStream.write(JSON.stringify(obj) + '\n');
  }
}

writeStream.end(() => {
  console.log('Generated 100k Q&A to', OUTPUT_FILE);
});
