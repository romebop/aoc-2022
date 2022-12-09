import { readFileSync } from 'fs';

const inputFile = process.argv.slice(2)[0];

type Direction = 'U' | 'D' | 'L' | 'R';
type Motion = { dir: Direction, steps: number };
type Point = { x: number, y: number };

const motions: Motion[] = readFileSync(inputFile, 'utf8').split('\n')
  .map(s => {
    const [dir, steps] = s.split(' ');
    return { dir, steps: +steps } as Motion;
  });

console.log(solve(motions));

function solve(motions: Motion[]): number {
  let head = { x: 0, y: 0 };
  let tail = { x: 0, y: 0 };
  const tailVisitLog = new Set<string>([serializePoint(tail)]);
  for (const m of motions) {
    for (let i = 0; i < m.steps; i++) {
      head = moveStep(head, m.dir)!;
      tail = updateTail(head, tail);
      tailVisitLog.add(serializePoint(tail));
    }
  }
  return tailVisitLog.size;
}

function moveStep({ x, y }: Point, dir: Direction): Point | void {
  if (dir === 'U') return { x, y: y - 1 };
  if (dir === 'D') return { x, y: y + 1 };
  if (dir === 'L') return { x: x - 1, y };
  if (dir === 'R') return { x: x + 1, y };
}

function updateTail(head: Point, tail: Point): Point {
  if (getDistance(head, tail) < 2) return tail;
  const x = head.x > tail.x ? tail.x + 1 : tail.x - 1;
  const y = head.y > tail.y ? tail.y + 1 : tail.y - 1;
  if (head.x === tail.x) return { ...tail, y };
  if (head.y === tail.y) return { ...tail, x };
  return { x, y };
}

function serializePoint({ x, y }: Point): string {
  return `(${x},${y})`;
}

function getDistance(p1: Point, p2: Point): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y)
}
