import { readFileSync } from 'fs';

const inputFile = process.argv.slice(2)[0];

type Instruction = { name: string, val?: number };

const instrs: Instruction[] = readFileSync(inputFile, 'utf8').split('\n')
  .map(s => {
    const [name, val] = s.split(' ');
    return name === 'noop' ? { name } : { name, val: +val };
  });

console.log(solve(instrs, [20, 60, 100, 140, 180, 220]));

function solve(instrs: Instruction[], targetCycles: number[]): number {
  let x = 1;
  let ptr = 0;
  let timer = 0;
  let temp: number | null = null;
  let signalStrengths: number[] = [];
  for (let cycle = 1; cycle <= 220; cycle++) {
    if (temp) {
      x += temp;
      temp = null;
    }
    const instr = instrs[ptr];
    if (instr.name === 'noop') {
      ptr++;
    }
    if (instr.name === 'addx') {
      if (timer === 0) {
        timer = 1;
      }
      else if (timer === 1) {
        timer--;
        temp = instr.val!;
        ptr++;
      }
    }
    if (targetCycles.includes(cycle)) {
      signalStrengths.push(cycle * x);
    }
  }
  return signalStrengths.reduce((a, c) => a + c);
}