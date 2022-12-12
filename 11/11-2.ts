import { readFileSync } from 'fs';

const inputFile = process.argv.slice(2)[0];

type Monki = {
  id: number,
  items: bigint[],
  op: (old: bigint) => bigint,
  divisor: number;
  test: (n: bigint) => number,
};

const monkiRegex = /^Monkey (?<id>\d+):\n  Starting items: (?<items>\d+(, \d+)*)\n  Operation: new = (?<op>.+)\n  Test: divisible by (?<divisor>\d+)\n    If true: throw to monkey (?<trueTarget>\d+)\n    If false: throw to monkey (?<falseTarget>\d+)$/;
const monkis: Monki[] = readFileSync(inputFile, 'utf8').split('\n\n')
  .map(s => {
    const { id, items, op, divisor, trueTarget, falseTarget } = s.match(monkiRegex)!.groups!;
    return {
      id: +id,
      items: items.split(', ').map(BigInt),
      op: eval(`old => ${op}`.replace(/(\d+)/g, 'BigInt($1)')), // this is a no-no
      divisor: +divisor,
      test: n => n % BigInt(+divisor) === 0n ? +trueTarget : +falseTarget,
    } as Monki;
  });

console.log(+solve(monkis, 10_000).toString());

function solve(monkis: Monki[], rounds: number): bigint {
  const capMod = BigInt(monkis.map(m => m.divisor).reduce((a, c) => a * c));
  const inspectionCounts = Array(monkis.length).fill(0n);
  for (let round = 1; round <= rounds; round++) {
    for (let i = 0; i < monkis.length; i++) {
      const monki = monkis[i];
      while (monki.items.length) {
        let item = monki.items.shift();
        item = monki.op(item!);
        item %= capMod;
        monkis[monki.test(item)].items.push(item);
        inspectionCounts[i]++;
      }
    }
  }
  return inspectionCounts.sort((a, b) => a < b ? 1 : -1)
    .slice(0, 2)
    .reduce((a, c) => a * c);
}
