import { readFileSync } from 'fs';

const inputFile = process.argv.slice(2)[0];

const signal = readFileSync(inputFile, 'utf8');
const startMarkerSize = 4;
const messageSize = 14;

console.log(solve(signal, startMarkerSize, messageSize));

function solve(signal: string, startMarkerSize: number, messageSize: number): number | void {
  let postStartMarkerIdx: number;
  for (let i = startMarkerSize - 1; i < signal.length; i++) {
    const buffer = signal.slice(i - (startMarkerSize - 1), i + 1);
    if (isDistinctChars(buffer)) {
      postStartMarkerIdx = i + 1;
      break;
    };
  }
  for (let i = postStartMarkerIdx! + messageSize - 1; i < signal.length; i++) {
    const buffer = signal.slice(i - (messageSize - 1), i + 1);
    if (isDistinctChars(buffer)) return i + 1;
  }
}

function isDistinctChars(s: string): boolean {
  return new Set(s.split('')).size === s.length;
}

