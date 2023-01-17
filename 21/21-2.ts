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
  const rootJob = monkeys.root;
  return involvesYou(monkeys, rootJob.monkey1!)
    ? getYourNumber(monkeys, rootJob.monkey1!, getNumber(monkeys, rootJob.monkey2!)!)
    : getYourNumber(monkeys, rootJob.monkey2!, getNumber(monkeys, rootJob.monkey1!)!);
}

function getNumber(monkeys: Record<string, Job>, name: string): number | void {
  const job = monkeys[name];
  if (job.type === 'number') return job.number!;
  if (job.operator === '+') return getNumber(monkeys, job.monkey1!)! + getNumber(monkeys, job.monkey2!)!;
  if (job.operator === '-') return getNumber(monkeys, job.monkey1!)! - getNumber(monkeys, job.monkey2!)!;
  if (job.operator === '*') return getNumber(monkeys, job.monkey1!)! * getNumber(monkeys, job.monkey2!)!;
  if (job.operator === '/') return getNumber(monkeys, job.monkey1!)! / getNumber(monkeys, job.monkey2!)!;
}

function involvesYou(monkeys: Record<string, Job>, name: string): boolean {
  if (name === 'humn') return true;
  const job = monkeys[name];
  if (job.type === 'number') return false;
  return involvesYou(monkeys, job.monkey1!) || involvesYou(monkeys, job.monkey2!);
}

function getYourNumber(monkeys: Record<string, Job>, name: string, val: number): number {
  if (name === 'humn') return val;
  const job = monkeys[name];
  if (involvesYou(monkeys, job.monkey1!)) {
    const right = getNumber(monkeys, job.monkey2!)!;
    let newVal: number;
    if (job.operator === '+') newVal = val - right;
    if (job.operator === '-') newVal = val + right;
    if (job.operator === '*') newVal = val / right;
    if (job.operator === '/') newVal = val * right;
    return getYourNumber(monkeys, job.monkey1!, newVal!)
  } else {
    const left = getNumber(monkeys, job.monkey1!)!;
    let newVal: number;
    if (job.operator === '+') newVal = val - left;
    if (job.operator === '-') newVal = left - val;
    if (job.operator === '*') newVal = val / left;
    if (job.operator === '/') newVal = left / val;
    return getYourNumber(monkeys, job.monkey2!, newVal!);
  }
}
