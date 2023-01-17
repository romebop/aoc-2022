import { readFileSync } from 'fs';

const inputFile = process.argv.slice(2)[0];
const snafus: string[] = readFileSync(inputFile, 'utf8').split('\n');

console.log(solve(snafus));

function solve(snafus: string[]): string {
  return getSnafu(
    snafus.map(getDecimal)
      .reduce((a, c) => a + c)
  );
}

function getSnafu(n: number): string {
  const snafuMap: Record<number, string> = { 2: '2', 1: '1', 0: '0', '-1': '-', '-2': '=' };
  const baseFive = n.toString(5);
  const parsed = baseFive.split('').map(Number).reverse();
  let result: number[] = [];
  let carry = 0;
  for (const num of parsed) {
    const val = num + carry;
    if (val > 2) {
      result.push(val - 5);
      carry = 1;
    } else {
      result.push(val);
      carry = 0;
    }
  }
  if (carry) result.push(carry);
  return result.map(n => snafuMap[n]).reverse().join('');
}

function getDecimal(snafu: string): number {
  const snafuMap: Record<string, number> = { 2: 2, 1: 1, 0: 0, '-': -1, '=': -2 };
  const parsed: number[] = snafu.split('')
    .map(c => snafuMap[c])
    .reverse();
  let sum = 0;
  for (let i = 0; i < parsed.length; i++) {
    sum += parsed[i] * (5 ** i);
  }
  return sum;
}
