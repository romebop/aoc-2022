import { readFileSync } from 'fs';

const inputFile = process.argv.slice(2)[0];

type Move = { source: number, target: number, quantity: number };
const [stacksStr, movesStr] = readFileSync(inputFile, 'utf8').split('\n\n');
const stacks = parseStacks(stacksStr);
const moves = parseMoves(movesStr);

console.log(solve(stacks, moves));

function parseStacks(stacksStr: string): Record<number, string[]>  {
  const stacksStrMatrix = stacksStr.split('\n').reverse().map(s => s.split(''));
  const stacks: Record<number, string[]> = {};
  for (let y = 0; y < stacksStrMatrix.length; y++) {
    for (let x = 0; x < stacksStrMatrix[0].length; x++) {
      const token = stacksStrMatrix[y][x];
      if (y === 0 && /\d/.test(token)) stacks[+token] = [];
      if (/[A-Z]/.test(token)) {
        const stackName = +stacksStrMatrix[0][x];
        stacks[stackName].push(token);
      }
    }
  }
  return stacks;
};

function parseMoves(movesStr: string): Move[] {
  const moveRegex = /move (?<quantity>\d+) from (?<source>\d+) to (?<target>\d+)/;
  return movesStr.split('\n')
    .map(s => {
      const groups = s.match(moveRegex)!.groups;
      return {
        source: +groups!.source,
        target: +groups!.target,
        quantity: +groups!.quantity,
      };
    });
}

function solve(stacks: Record<number, string[]>, moves: Move[]): string {
  for (const m of moves) {
    for (let i = 0; i < m.quantity; i++) {
      stacks[m.target].push(stacks[m.source].pop()!);
    }
  }
  return Object.keys(stacks)
    .map(stackName => stacks[+stackName].at(-1) as string)
    .reduce((a, c) => a + c);
}