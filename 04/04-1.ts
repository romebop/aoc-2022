import { readFileSync } from 'fs';

const inputFile = process.argv.slice(2)[0];

type Range = { start: number, end: number };
const rangePairs: [Range, Range][] = readFileSync(inputFile, 'utf8')
  .split('\n')
  .map(s => s.split(',').map(s => {
    const [start, end] = s.split('-').map(Number);
    return { start, end };
  }) as [Range, Range]);

console.log(solve(rangePairs));

function solve(rangePairs: [Range, Range][]): number {
  return rangePairs.map(containsFully)
    .reduce((a, c) => a + +c, 0);
}

function containsFully([r1, r2]: [Range, Range]): boolean {
  return (r1.start >= r2.start && r1.end <= r2.end)
    || (r1.start <= r2.start && r1.end >= r2.end);
}
