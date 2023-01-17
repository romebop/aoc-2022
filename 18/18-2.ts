import { readFileSync } from 'fs';
import { Bounds, Point } from '../util/3d';

const inputFile = process.argv.slice(2)[0];
const droplet: Point[] = readFileSync(inputFile, 'utf8').split('\n')
  .map(s => {
    const [x, y, z] = s.split(',').map(Number);
    return { x, y, z };
  });

console.log(solve(droplet));

function solve(droplet: Point[]): number {
  const pointSet = new Set(droplet.map(serializePoint));
  const bounds = getBounds(droplet);
  let surfaceArea = 0;
  for (const p of droplet) {
    for (const n of getNeighbors(p)) {
      if (!pointSet.has(serializePoint(n)) && canEscape(pointSet, bounds, n)) {
        surfaceArea++;
      }
    }
  }
  return surfaceArea;
}

function serializePoint({ x, y, z }: Point): string {
  return `(${x},${y},${z})`;
}

function getBounds(points: Point[]): Bounds {
  return {
    x: {
      min: Math.min(...points.map(p => p.x)),
      max: Math.max(...points.map(p => p.x)),
    },
    y: {
      min: Math.min(...points.map(p => p.y)),
      max: Math.max(...points.map(p => p.y)),
    },
    z: {
      min: Math.min(...points.map(p => p.z)),
      max: Math.max(...points.map(p => p.z)),
    },
  };
}

function getNeighbors({ x, y, z }: Point): Point[] {
  return [
    { x: x + 1, y, z },
    { x: x - 1, y, z },
    { x, y: y + 1, z },
    { x, y: y - 1, z },
    { x, y, z: z + 1 },
    { x, y, z: z - 1 },
  ];
}

function canEscape(pointSet: Set<string>, b: Bounds, p: Point, visitLog = new Set<string>()): boolean {
  if (p.x < b.x.min || p.x > b.x.max || p.y < b.y.min || p.y > b.y.max || p.z < b.z.min || p.z > b.z.max) return true;
  const sp = serializePoint(p);
  if (pointSet.has(sp) || visitLog.has(sp)) return false;
  visitLog.add(sp);
  return getNeighbors(p).reduce((a, n) => a || canEscape(pointSet, b, n, visitLog), false);
}