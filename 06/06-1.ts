import { readFileSync } from 'fs';

const inputFile = process.argv.slice(2)[0];

const signal = readFileSync(inputFile, 'utf8');
const startMarkerSize = 4;

console.log(solve(signal, startMarkerSize));

function solve(signal: string, startMarkerSize: number): number | void {
  for (let i = startMarkerSize - 1; i < signal.length; i++) {
    const buffer = signal.slice(i - (startMarkerSize - 1), i + 1);
    if (isDistinctChars(buffer)) return i + 1;
  }
}

function isDistinctChars(s: string): boolean {
  return new Set(s.split('')).size === s.length;
}
