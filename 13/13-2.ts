import { readFileSync } from 'fs';

const inputFile = process.argv.slice(2)[0];

type Data = number | Data[];
const dividerPackets: Data[] = [[[2]], [[6]]];
const packets: Data[] = readFileSync(inputFile, 'utf8')
  .replaceAll('\n\n', '\n')
  .split('\n')
  .map(s => JSON.parse(s))
  .concat(dividerPackets);

console.log(solve(packets));

function solve(packets: Data[]): number {
  return packets.sort((a, b) => isOrdered(a, b)! ? -1 : 1)
    .reduce((a: number, c, i) => (
      dividerPackets.map(p => JSON.stringify(p)).includes(JSON.stringify(c))
        ? a * (i + 1)
        : a
    ), 1);
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