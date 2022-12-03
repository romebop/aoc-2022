import { readFileSync } from 'fs';
import { chunkArray, getIntersect } from '../util';

const inputFile = process.argv.slice(2)[0];

const groups: string[][][] = chunkArray(
  readFileSync(inputFile, 'utf8').split('\n').map(s => s.split('')),
  3,
);

console.log(solve(groups));

function solve(groups: string[][][]): number {
  return groups.map(g => getIntersect(g)[0])
    .map(getPriority)
    .reduce((a, c) => a + c);
}

function getPriority(item: string): number {
  if (/[a-z]/.test(item)) return item.charCodeAt(0) - 96;
  return item.charCodeAt(0) - 38;
}
