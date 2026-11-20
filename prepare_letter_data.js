import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawParas = JSON.parse(fs.readFileSync(path.join(__dirname, 'cleaned_letter.json'), 'utf8'));

// Filter out any stray part headings or section labels
const cleanedParas = rawParas.filter(p => {
  const trimmed = p.trim();
  if (/^part\s+\d+/i.test(trimmed)) return false;
  if (/^section\s+\d+/i.test(trimmed)) return false;
  if (/^chapter\s+\d+/i.test(trimmed)) return false;
  if (/^hissa\s+\d+/i.test(trimmed)) return false;
  return true;
});

const letterData = {
  totalParagraphs: cleanedParas.length,
  totalWords: cleanedParas.reduce((acc, p) => acc + p.split(/\s+/).filter(Boolean).length, 0),
  paragraphs: cleanedParas
};

const srcDataDir = path.join(__dirname, 'src', 'data');
fs.writeFileSync(path.join(srcDataDir, 'letterData.json'), JSON.stringify(letterData, null, 2), 'utf8');

console.log('Successfully updated src/data/letterData.json without any parts or section headers!');
console.log('Total paras:', letterData.totalParagraphs, 'Total words:', letterData.totalWords);
