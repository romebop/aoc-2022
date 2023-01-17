import { readFileSync } from 'fs';
import { Bounds, deserializePoint, Point, serializePoint } from '../util';

type Direction = 'N' | 'S' | 'W' | 'E';
const inputFile = process.argv.slice(2)[0];
const data: string[][] = readFileSync(inputFile, 'utf8').split('\n').map(s => s.split(''));
const elves = getElves(data);

console.log(solve(elves));

function solve(elves: Set<string>, rounds = Infinity): number | void {
  const currElves = new Set(elves);
  const directions: Direction[] = ['N', 'S', 'W', 'E'];
  // console.log('\nInitial:');
  // console.log(getMapStr(currElves));
  for (let round = 1; round <= rounds; round++) {
    const proposals: Record<string, string[]> = {};
    for (const se of currElves) {
      const e = deserializePoint(se);
      if (!hasNeighbor(currElves, e)) continue;
      for (const d of directions) {
        if (!canPropose(currElves, e, d)) continue;
        const sd = serializePoint(getDestination(e, d)!);
        if (sd in proposals) {
          proposals[sd].push(se);
        } else {
          proposals[sd] = [se];
        }
        break;
      } 
    }
    if (Object.values(proposals).every(a => a.length !== 1)) return round;
    for (const sd in proposals) {
      if (proposals[sd].length !== 1) continue;
      currElves.delete(proposals[sd][0]);
      currElves.add(sd);
    }
    directions.push(directions.shift()!);
    // console.log(`\nAfter round: ${round}`);
    // console.log(getMapStr(currElves));
  }
}

function getElves(data: string[][]): Set<string> {
  const elves: Point[] = [];
  for (let y = 0; y < data.length; y++) {
    for (let x = 0; x < data[0].length; x++) {
      if (data[y][x] === '#') elves.push({ x, y });
    }
  }
  return new Set<string>(elves.map(serializePoint));
}

function getMapStr(elves: Set<string>, buffer = 2): string {
  const points = Array.from(elves).map(deserializePoint);
  const b = getBounds(points);
  const map: string[][] = Array((b.y.max - b.y.min + 1) + (buffer * 2)).fill(null)
    .map(r => Array((b.x.max - b.x.min + 1) + (buffer * 2)).fill('.'));
  points.forEach(({ x, y }) => map[buffer + y - b.y.min][buffer + x - b.x.min] = '#');
  return map.map(r => r.join('')).join('\n');
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
  };
}

function getAdjacents(p: Point, dir: Direction | null = null): Point[] {
  if (dir === 'N') {
    return [
      { x: p.x - 1, y: p.y - 1 },
      { x: p.x,     y: p.y - 1 },
      { x: p.x + 1, y: p.y - 1 },
    ];
  }
  if (dir === 'S') {
    return [
      { x: p.x - 1, y: p.y + 1 },
      { x: p.x,     y: p.y + 1 },
      { x: p.x + 1, y: p.y + 1 },
    ];
  } 
  if (dir === 'W') {
    return [
      { x: p.x - 1, y: p.y - 1 },
      { x: p.x - 1, y: p.y     },
      { x: p.x - 1, y: p.y + 1 },
    ];
  }
  if (dir === 'E') {
    return [
      { x: p.x + 1, y: p.y - 1 },
      { x: p.x + 1, y: p.y     },
      { x: p.x + 1, y: p.y + 1 },
    ];
  }
  const neighbors: Point[] = [];
  for (let y = p.y - 1; y <= p.y + 1; y++) {
    for (let x = p.x - 1; x <= p.x + 1; x++) {
      if (x === p.x && y === p.y) continue;
      neighbors.push({ x, y });
    }
  }
  return neighbors;
}

function getDestination({ x, y }: Point, dir: Direction): Point | void {
  if (dir === 'N') {
    return { x, y: y - 1 };
  }
  if (dir === 'S') {
    return { x, y: y + 1 };
  }
  if (dir === 'W') {
    return { x: x - 1, y };
  }
  if (dir === 'E') {
    return { x: x + 1, y };
  }
}

function hasNeighbor(set: Set<string>, p: Point): boolean {
  return getAdjacents(p).some(a => set.has(serializePoint(a)));
}

function canPropose(set: Set<string>, p: Point, d: Direction): boolean {
  return !getAdjacents(p, d).some(a => set.has(serializePoint(a)));
}
