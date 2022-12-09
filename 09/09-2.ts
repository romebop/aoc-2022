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

console.log(solve(motions, 10));

function solve(motions: Motion[], numKnots: number): number {
  const knots: Point[] = Array(numKnots).fill(null).map(_ => ({ x: 0, y: 0 }));
  const tailVisitLog = new Set<string>([serializePoint(knots.at(-1)!)]);
  for (const m of motions) {
    for (let i = 0; i < m.steps; i++) {
      knots[0] = moveStep(knots[0], m.dir)!;
      for (let j = 0; j < knots.length - 1; j++) {
        knots[j + 1] = updateKnot(knots[j], knots[j + 1]);
      }
      tailVisitLog.add(serializePoint(knots.at(-1)!));
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

function updateKnot(lead: Point, chase: Point): Point {
  if (getDistance(lead, chase) < 2) return chase;
  const x = lead.x > chase.x ? chase.x + 1 : chase.x - 1;
  const y = lead.y > chase.y ? chase.y + 1 : chase.y - 1;
  if (lead.x === chase.x) return { ...chase, y };
  if (lead.y === chase.y) return { ...chase, x };
  return { x, y };
}

function serializePoint({ x, y }: Point): string {
  return `(${x},${y})`;
}

function getDistance(p1: Point, p2: Point): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y)
}
