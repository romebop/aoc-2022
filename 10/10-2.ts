import { readFileSync } from 'fs';
import { getRange } from '../util';

const inputFile = process.argv.slice(2)[0];

type Instruction = { name: string, val?: number };

const instrs: Instruction[] = readFileSync(inputFile, 'utf8').split('\n')
  .map(s => {
    const [name, val] = s.split(' ');
    return name === 'noop' ? { name } : { name, val: +val };
  });

solve(instrs);

function solve(instrs: Instruction[]): void {
  let x = 1;
  const spriteWidth = 3;
  let ptr = 0;
  let timer = 0;
  let temp: number | null = null;
  const crtWidth = 40;
  const crtHeight = 6;
  const crt: string[] = Array(crtWidth * crtHeight).fill(null);
  for (let cycle = 1; cycle <= crtWidth * crtHeight; cycle++) {
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
    const spriteRange = getRange(x - ((spriteWidth - 1) / 2), x + ((spriteWidth - 1) / 2) + 1);
    crt[cycle - 1] = spriteRange.includes((cycle % crtWidth) - 1) ? '#' : '.';
  }
  printCrt(crt, crtWidth);
}

function printCrt(crt: string[], width: number): void {
  console.log(
    crt.reduce((a, c, i) => a + ((i + 1) % width === 0 ? `${c}\n` : c))
  );
}