import { readFileSync } from 'fs';
import { getIntersect } from '../util';

const inputFile = process.argv.slice(2)[0];

const rucksacks: [string[], string[]][] = readFileSync(inputFile, 'utf8')
  .split('\n')
  .map(s => [
    s.slice(0, s.length / 2).split(''),
    s.slice(s.length / 2, s.length).split(''),
  ]);

console.log(solve(rucksacks));

function solve(rucksacks: [string[], string[]][]): number {
  return rucksacks.map(r => getIntersect(r)[0])
    .map(i => getPriority(i)!)
    .reduce((a, c) => a + c);
}

function getPriority(item: string): number | void {
  if (/[a-z]/.test(item)) return item.charCodeAt(0) - 96;
  if (/[A-Z]/.test(item)) return item.charCodeAt(0) - 38;
}
