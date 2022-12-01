import { readFileSync } from 'fs';

const inputFile = process.argv.slice(2)[0];

const elves: number[][] = readFileSync(inputFile, 'utf8')
  .split('\n\n')
  .map(s => s.split('\n').map(Number));

console.log(solve(elves));

function solve(elves: number[][]): number {
  return Math.max(
    ...elves.map(foods => foods.reduce((a, c) => a + c))
  );
}
