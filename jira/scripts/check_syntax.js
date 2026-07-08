const fs = require('fs');
const c = fs.readFileSync('src/app/(protected)/admin/scrum-eval/ScrumEvalAdmin.tsx', 'utf8');
const lines = c.split('\n');
// Count brace balance
let braceCount = 0;
let parenCount = 0;
let bracketCount = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Skip comments and strings
  for (const ch of line) {
    if (ch === '{') braceCount++;
    if (ch === '}') braceCount--;
    if (ch === '(') parenCount++;
    if (ch === ')') parenCount--;
    if (ch === '[') bracketCount++;
    if (ch === ']') bracketCount--;
  }
}
console.log('Braces: ' + braceCount + ' (should be 0)');
console.log('Parens: ' + parenCount + ' (should be 0)');
console.log('Brackets: ' + bracketCount + ' (should be 0)');
