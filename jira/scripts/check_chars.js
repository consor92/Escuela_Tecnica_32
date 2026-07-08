const fs = require('fs');
const c = fs.readFileSync('src/app/(protected)/admin/scrum-eval/ScrumEvalAdmin.tsx', 'utf8');
const lines = c.split('\n');
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  for (let j = 0; j < l.length; j++) {
    const code = l.charCodeAt(j);
    if (code > 127 || (code < 32 && code !== 10 && code !== 13 && code !== 9)) {
      console.log('Line ' + (i+1) + ' col ' + j + ' char=' + code.toString(16) + ' context: ' + l.substring(Math.max(0,j-10), j+10));
    }
  }
}
console.log('Check complete.');
