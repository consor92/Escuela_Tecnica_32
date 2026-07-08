const fs = require('fs');
const c = fs.readFileSync('src/app/(protected)/admin/scrum-eval/ScrumEvalAdmin.tsx', 'utf8');
const lines = c.split('\n');
let openFragments = 0;
let closeFragments = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Check for <> that opens a fragment (not </> and not part of JSX like <div)
  const openMatch = line.match(/^\s*<>$/);
  const closeMatch = line.match(/^\s*<\/>.*/);
  if (openMatch) {
    openFragments++;
    console.log(`Line ${i+1}: OPEN <> (count ${openFragments})`);
  }
  if (closeMatch) {
    closeFragments++;
    console.log(`Line ${i+1}: CLOSE </> (count ${closeFragments})`);
  }
}
console.log(`\nOpen fragments: ${openFragments}`);
console.log(`Close fragments: ${closeFragments}`);
console.log(`Balance: ${openFragments - closeFragments} (should be 0)`);
