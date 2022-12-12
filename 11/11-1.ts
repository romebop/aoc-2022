import { readFileSync } from 'fs';

const inputFile = process.argv.slice(2)[0];

type Monki = {
  id: number,
  items: number[],
  op: (old: number) => number,
  test: (n: number) => number,
};

const monkiRegex = /^Monkey (?<id>\d+):\n  Starting items: (?<items>\d+(, \d+)*)\n  Operation: new = (?<op>.+)\n  Test: divisible by (?<divisor>\d+)\n    If true: throw to monkey (?<trueTarget>\d+)\n    If false: throw to monkey (?<falseTarget>\d+)$/;
const monkis: Monki[] = readFileSync(inputFile, 'utf8').split('\n\n')
  .map(s => {
    const { id, items, op, divisor, trueTarget, falseTarget } = s.match(monkiRegex)!.groups!;
    return {
      id: +id,
      items: items.split(', ').map(Number),
      op: eval(`old => ${op}`), // this is a no-no
      test: n => n % +divisor === 0 ? +trueTarget : +falseTarget,
    } as Monki;
  });

console.log(solve(monkis, 20));

function solve(monkis: Monki[], rounds: number): number {
  const inspectionCounts = Array(monkis.length).fill(0);
  for (let round = 1; round <= rounds; round++) {
    for (let i = 0; i < monkis.length; i++) {
      const monki = monkis[i];
      while (monki.items.length) {
        let item = monki.items.shift();
        item = monki.op(item!);
        item = Math.floor(item / 3);
        monkis[monki.test(item)].items.push(item);
        inspectionCounts[i]++;
      }
    }
  }
  return inspectionCounts.sort((a, b) => b - a)
    .slice(0, 2)
    .reduce((a, c) => a * c);
}
