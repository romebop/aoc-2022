import { readFileSync } from 'fs';

const inputFile = process.argv.slice(2)[0];

type Data = number | Data[];
const pairs: [Data, Data][] = readFileSync(inputFile, 'utf8').split('\n\n')
  .map(s => s.split('\n').map(pStr => JSON.parse(pStr)) as [Data, Data]);

console.log(solve(pairs));

function solve(pairs: [Data, Data][]): number {
  return pairs.map(p => isOrdered(p[0], p[1])!)
    .map((isOrdered, i) => isOrdered ? (i + 1) : 0)
    .reduce((a, c) => a + c, 0);
}

function isOrdered(p: Data, q: Data): boolean | null {
  if (!Array.isArray(p) && !Array.isArray(q)) {
    if (p === q) return null;
    return p < q;
  }
  if (!Array.isArray(p)) p = [p];
  if (!Array.isArray(q)) q = [q];
  for (let i = 0; i < Math.max(p.length, q.length); i++) {
    if (i === p.length && i < q.length) return true;
    if (i === q.length && i < p.length) return false;
    const result = isOrdered(p[i], q[i]);
    if (result !== null) return result;
  }
  return null;
}