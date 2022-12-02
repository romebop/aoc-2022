import { readFileSync } from 'fs';

const inputFile = process.argv.slice(2)[0];

type MoveSymbol = 'A' | 'B' | 'C';
type Move = 'Rock' | 'Paper' | 'Scissors';
const moveMap: Record<MoveSymbol, Move> = {
  A: 'Rock',
  B: 'Paper',
  C: 'Scissors',
};
const movePointMap: Record<Move, number> = {
  Rock: 1,
  Paper: 2,
  Scissors: 3,
};

type OutcomeSymbol = 'X' | 'Y' | 'Z';
type Outcome = 'Win' | 'Lose' | 'Draw';
const outcomeMap: Record<OutcomeSymbol, Outcome> = {
  X: 'Lose',
  Y: 'Draw',
  Z: 'Win',
};
const outcomePointMap: Record<Outcome, number> = {
  Win: 6,
  Lose: 0,
  Draw: 3,
};

type Round = { opponentMove: Move, targetOutcome: Outcome };
const rounds: Round[] = readFileSync(inputFile, 'utf8')
  .split('\n')
  .map(s => {
    const symbols = s.split(' ') as [MoveSymbol, OutcomeSymbol];
    return {
      opponentMove: moveMap[symbols[0]],
      targetOutcome: outcomeMap[symbols[1]],
    };
  });

console.log(solve(rounds));

function solve(rounds: Round[]): number {
  return rounds
    .map(r => movePointMap[getMove(r)] + outcomePointMap[r.targetOutcome])
    .reduce((a, c) => a + c);
}

function getMove({ opponentMove, targetOutcome }: Round): Move {
  if (targetOutcome === 'Win') {
    if (opponentMove === 'Rock') return 'Paper';
    if (opponentMove === 'Paper') return 'Scissors';
    if (opponentMove === 'Scissors') return 'Rock';
  }
  if (targetOutcome === 'Lose') {
    if (opponentMove === 'Rock') return 'Scissors';
    if (opponentMove === 'Paper') return 'Rock';
    if (opponentMove === 'Scissors') return 'Paper';
  }
  return opponentMove;
}
