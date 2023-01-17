import { readFileSync } from 'fs';

type JobType = 'number' | 'operation';
type Operator = '+' | '-' | '*' | '/';
type Job = { type: JobType, number?: number, operator?: Operator, monkey1?: string, monkey2?: string };
const inputFile = process.argv.slice(2)[0];
const monkeys: Record<string, Job> = readFileSync(inputFile, 'utf8').split('\n')
  .reduce((monkeys: Record<string, Job>, monkeyStr: string) => {
    const [name, jobStr] = monkeyStr.split(': ');
    const jobArr = jobStr.split(' ');
    monkeys[name] = jobArr.length === 1
      ? { type: 'number', number: +jobArr[0] }
      : { type: 'operation', operator: jobArr[1] as Operator, monkey1: jobArr[0], monkey2: jobArr[2] };
    return monkeys;
  }, {});

console.log(solve(monkeys));

function solve(monkeys: Record<string, Job>): number {
  return getNumber(monkeys, 'root');
}

function getNumber(monkeys: Record<string, Job>, name: string): number {
  const job = monkeys[name];
  if (job.type === 'number') return job.number!;
  return eval(`${getNumber(monkeys, job.monkey1!)} ${job.operator} ${getNumber(monkeys, job.monkey2!)}`);
}
