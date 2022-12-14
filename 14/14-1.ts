import { readFileSync } from 'fs';
import { serializePoint, Point } from '../util';

const inputFile = process.argv.slice(2)[0];

const rockPaths: Point[][] = readFileSync(inputFile, 'utf8').split('\n')
  .map(s => s.split(' -> ').map(ps => {
    const [xs, ys] = ps.split(',');
    return { x: +xs, y: +ys };
  }));
const source = { x: 500, y: 0 };

console.log(solve(rockPaths, source));

function solve(rockPaths: Point[][], source: Point): number {
  let fallingSand = { ...source };
  const restingSands = new Set<string>();
  while (!isInVoid(rockPaths, fallingSand)) {
    const updatedSand = getUpdatedSand(rockPaths, restingSands, fallingSand);
    if (updatedSand === null) {
      restingSands.add(serializePoint(fallingSand));
      fallingSand = { ...source };
    } else {
      fallingSand = updatedSand;
    }
  }
  return restingSands.size;
}

function isInVoid(rockPaths: Point[][], fallingSand: Point): boolean {
  return fallingSand.y >= Math.max(...rockPaths.flat().map(p => p.y));
}

function getUpdatedSand(rockPaths: Point[][], restingSands: Set<string>, { x, y }: Point): Point | null {
  if (!isOccupied(rockPaths, restingSands, { x, y: y + 1 })) return { x, y: y + 1 }; 
  if (!isOccupied(rockPaths, restingSands, { x: x - 1, y: y + 1 })) return { x: x - 1, y: y + 1 }; 
  if (!isOccupied(rockPaths, restingSands, { x: x + 1, y: y + 1 })) return { x: x + 1, y: y + 1 }; 
  return null;
}

function isOccupied(rockPaths: Point[][], restingSands: Set<string>, p: Point): boolean {
  return isInRockPath(rockPaths, p) || restingSands.has(serializePoint(p));
}

function isInRockPath(rockPaths: Point[][], p: Point): boolean {
  for (const path of rockPaths) {
    for (let i = 0; i < path.length - 1; i++) {
      if (
        (path[i].x === path[i + 1].x && p.x === path[i].x && isContained(path[i].y, path[i + 1].y)(p.y))
        || (path[i].y === path[i + 1].y && p.y === path[i].y && isContained(path[i].x, path[i + 1].x)(p.x))
      ) return true;
    }
  }
  return false;
}

function isContained(a: number, b: number): (v: number) => boolean {
  return (v: number) => Math.min(a, b) <= v && v <= Math.max(a, b);
}