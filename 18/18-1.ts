import { readFileSync } from 'fs';
import { Point } from '../util/3d';

const inputFile = process.argv.slice(2)[0];
const droplet: Point[] = readFileSync(inputFile, 'utf8').split('\n')
  .map(s => {
    const [x, y, z] = s.split(',').map(Number);
    return { x, y, z };
  });

console.log(solve(droplet));

function solve(droplet: Point[]): number {
  const seenPoints: Point[] = [];
  let surfaceArea = 0;
  for (const p of droplet) {
    let addSurfaceArea = 6;
    for (const q of seenPoints) {
      if (isAdjacent(p, q)) addSurfaceArea -= 2;
    }
    surfaceArea += addSurfaceArea;
    seenPoints.push(p);
  }
  return surfaceArea;
}

function isAdjacent(p1: Point, p2: Point): boolean {
  return (p1.x === p2.x && p1.y === p2.y && (Math.abs(p1.z - p2.z) === 1))
    || (p1.z === p2.z && p1.x === p2.x && (Math.abs(p1.y - p2.y) === 1))
    || (p1.y === p2.y && p1.z === p2.z && (Math.abs(p1.x - p2.x) === 1));
}
