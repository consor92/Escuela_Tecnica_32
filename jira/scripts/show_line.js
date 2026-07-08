const fs = require('fs');
const c = fs.readFileSync('src/app/(protected)/admin/scrum-eval/ScrumEvalAdmin.tsx', 'utf8');
const lines = c.split('\n');
for (let i = 208; i < 218; i++) {
  console.log('' + (i+1) + ': ' + lines[i].replace(/\t/g, ' '));
}
