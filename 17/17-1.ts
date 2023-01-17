import { readFileSync } from 'fs';
import { deserializePoint, serializePoint, Point } from '../util';

const rockTypes: Point[][] = [
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }],
  [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }],
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
  [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }],
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
];
const inputFile = process.argv.slice(2)[0];
const jetPattern: string[] = readFileSync(inputFile, 'utf8').split('');

console.log(solve(rockTypes, jetPattern));

function solve(rockTypes: Point[][], jetPattern: string[]): number | void {
  const tower = new Set<string>();
  let height = 0;
  let numStoppedRocks = 0;
  let rockIdx = 0;
  let jetIdx = 0;
  while (true) {
    if (numStoppedRocks === 2022) return height;
    let rock = getNewRock(rockTypes[rockIdx], height);
    rockIdx = (rockIdx + 1) % rockTypes.length;
    while (true) {
      rock = getPushedRock(tower, rock, jetPattern[jetIdx])!;
      jetIdx = (jetIdx + 1) % jetPattern.length;
      const fallenRock = getFallenRock(rock, tower);
      if (fallenRock === null) {
        numStoppedRocks++;
        height = Math.max(height, ...rock.map(p => p.y));
        rock.forEach(p => tower.add(serializePoint(p)));
        break;
      }
      rock = fallenRock;
    }
  }
}

function getNewRock(rockType: Point[], height: number): Point[] {
  return rockType.map(({ x, y }) => ({ x: 2 + x + 1, y: height + 3 + y + 1 }));
}

function getPushedRock(tower: Set<string>, rock: Point[], jet: string): Point[] | void {
  let pushedRock: Point[]
  if (jet === '<') pushedRock = rock.map(({ x, y }) => ({ x: x - 1, y }));
  if (jet === '>') pushedRock = rock.map(({ x, y }) => ({ x: x + 1, y }));
  const isInTower = pushedRock!.map(serializePoint).some(sp => tower.has(sp));
  const xVals = pushedRock!.map(p => p.x);
  return (Math.min(...xVals) < 1 || Math.max(...xVals) > 7 || isInTower) ? rock : pushedRock!;
}

function getFallenRock(rock: Point[], tower: Set<string>): Point[] | null {
  const fallenRock = rock.map(({ x, y }) => ({ x, y: y - 1 }));
  const isInTower = fallenRock.map(serializePoint).some(sp => tower.has(sp));
  const isInFloor = fallenRock.some(p => p.y === 0);
  return (isInTower || isInFloor) ? null : fallenRock;
}

function printState(tower: Set<string>, rock: Point[]): void {
  const fallenPoints: Point[] = [];
  for (const sp of tower) {
    fallenPoints.push(deserializePoint(sp));
  }

  const height = Math.max(...fallenPoints.map(p => p.y), ...rock.map(p => p.y)) + 1;

  const grid = Array(height).fill(null).map(() => Array(9).fill('.'));
  rock.forEach(({ x, y }) => grid[y][x] = '@');
  fallenPoints.forEach(({ x, y }) => grid[y][x] = '#');
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      if (y === 0 && (x === 0 || x === 8)) {
        grid[y][x] = '+';
      } else if (y === 0) {
        grid[y][x] = '-';
      } else if (x === 0 || x === 8) {        
        grid[y][x] = '|';
      }
    }
  }
  const rows = grid.map(arr => arr.join(''));
  const str = rows.reverse().join('\n');
  console.log(str + '\n');
}