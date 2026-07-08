const fs = require('fs');
const c = fs.readFileSync('src/app/(protected)/admin/scrum-eval/ScrumEvalAdmin.tsx', 'utf8');
const lines = c.split('\n');
let openFragments = 0;
let closeFragments = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('<>') && !line.includes('</>') && !line.includes('!==') && !line.includes('<=') && !line.includes('>=') && !line.match(/className|style|React\.|else|=>/)) {
    const stripped = line.replace(/".*?"/g, '').replace(/'.*?'/g, '');
    if (stripped.includes('<>')) {
      openFragments++;
      console.log(`Line ${i+1}: OPEN <>`);
    }
  }
  if (line.includes('</>')) {
    closeFragments++;
    console.log(`Line ${i+1}: CLOSE </>`);
  }
}
console.log(`\nOpen fragments: ${openFragments}`);
console.log(`Close fragments: ${closeFragments}`);
console.log(`Balance: ${openFragments - closeFragments}`);
