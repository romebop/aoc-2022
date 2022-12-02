import { readFileSync } from 'fs';

const inputFile = process.argv.slice(2)[0];

type MoveSymbol = 'A' | 'B' | 'C' | 'X' | 'Y' | 'Z';
type Move = 'Rock' | 'Paper' | 'Scissors';
const moveMap: Record<MoveSymbol, Move> = {
  A: 'Rock',
  B: 'Paper',
  C: 'Scissors',
  X: 'Rock',
  Y: 'Paper',
  Z: 'Scissors',
};
const movePointMap: Record<Move, number> = {
  Rock: 1,
  Paper: 2,
  Scissors: 3,
};

type Outcome = 'Win' | 'Lose' | 'Draw';
const outcomePointMap: Record<Outcome, number> = {
  Win: 6,
  Lose: 0,
  Draw: 3,
};

type Round = { myMove: Move, opponentMove: Move };
const rounds: Round[] = readFileSync(inputFile, 'utf8')
  .split('\n')
  .map(s => {
    const symbols = s.split(' ') as MoveSymbol[];
    return {
      myMove: moveMap[symbols[1]],
      opponentMove: moveMap[symbols[0]],
    };
  });

console.log(solve(rounds));

function solve(rounds: Round[]): number {
  return rounds
    .map(r => movePointMap[r.myMove] + outcomePointMap[getOutcome(r)])
    .reduce((a, c) => a + c);
}

function getOutcome({ myMove, opponentMove }: Round): Outcome {
  if (myMove === opponentMove) return 'Draw';
  if (
    (myMove === 'Rock' && opponentMove === 'Scissors')
    || (myMove === 'Paper' && opponentMove === 'Rock')
    || (myMove === 'Scissors' && opponentMove === 'Paper')
  ) return 'Win';
  return 'Lose';
}
