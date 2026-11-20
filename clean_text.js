const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'extracted_raw_text.txt'), 'utf8');

// Comprehensive emoji remover regex
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu;

// Also clean asterisks, hashtags, markdown styling like **bold** or *italic* if used as formatting remnants
let cleanContent = content.replace(emojiRegex, '');

const rawLines = cleanContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

const cleanedParagraphs = [];
const removedList = [];

for (let i = 0; i < rawLines.length; i++) {
  let line = rawLines[i];

  // Remove meta titles
  if (/^conversation\s+with\s+gemini/i.test(line)) {
    removedList.push(line);
    continue;
  }

  // Any numbered headings: '1.', '1. Heading', '2) ...', '34. ...'
  if (/^\d+[\.\)]\s*/.test(line)) {
    removedList.push(line);
    continue;
  }

  // Pure heading like 'Tumhari understanding', 'Tumhara confidence', etc.
  // Generally <= 65 chars and doesn't end with sentence-ending punctuation like '.', '!', '?'
  const endsWithPunct = /[.!?…]$/.test(line);
  if (!endsWithPunct && line.length < 80) {
    removedList.push(line);
    continue;
  }

  // Clean markdown asterisks or hashes
  line = line.replace(/^\s*[#*_\-]+\s*/, '').replace(/\s*[#*_\-]+$/, '').replace(/\*\*/g, '');

  if (line.trim().length > 0) {
    cleanedParagraphs.push(line.trim());
  }
}

console.log('Total input lines:', rawLines.length);
console.log('Removed headings/titles:', removedList.length);
console.log('Final paragraphs:', cleanedParagraphs.length);

const totalWords = cleanedParagraphs.reduce((acc, p) => acc + p.split(/\s+/).filter(Boolean).length, 0);
console.log('Total words in cleaned paragraphs:', totalWords);

// Let's save both full text and a JSON file
fs.writeFileSync(path.join(__dirname, 'cleaned_letter.txt'), cleanedParagraphs.join('\n\n'), 'utf8');
fs.writeFileSync(path.join(__dirname, 'cleaned_letter.json'), JSON.stringify(cleanedParagraphs, null, 2), 'utf8');

console.log('Sample of first 5 paragraphs:');
console.log(cleanedParagraphs.slice(0, 5));
console.log('Sample of last 5 paragraphs:');
console.log(cleanedParagraphs.slice(-5));
