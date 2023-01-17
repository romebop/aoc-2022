import { readFileSync } from 'fs';
import { serializePoint, Point } from '../util';

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
  let rockIdx = -1;
  let jetIdx = -1;
  let cache = new Set<string>();
  let hitCounter = 0;
  let oldHeight: number;
  let oldNumStoppedRocks: number;
  let phantomHeight = 0;
  while (true) {
    rockIdx = (rockIdx + 1) % rockTypes.length;
    if (numStoppedRocks === 1_000_000_000_000) return height + phantomHeight;
    let rock = getNewRock(rockTypes[rockIdx], height);
    while (true) {
      jetIdx = (jetIdx + 1) % jetPattern.length;
      rock = getPushedRock(tower, rock, jetPattern[jetIdx])!;
      const fallenRock = getFallenRock(rock, tower);
      if (fallenRock === null) {
        numStoppedRocks++;
        height = Math.max(height, ...rock.map(p => p.y));
        rock.forEach(p => tower.add(serializePoint(p)));
        if (cache.has(JSON.stringify([rockIdx, jetIdx, rock.map(p => p.x)]))) {
          hitCounter++;
          if (hitCounter === 1) {
            oldHeight = height;
            oldNumStoppedRocks = numStoppedRocks;
            cache = new Set<string>([JSON.stringify([rockIdx, jetIdx, rock.map(p => p.x)])]); 
          }
          if (hitCounter === 2) {
            const cycleHeight = height - oldHeight!;
            const cycleNum = numStoppedRocks - oldNumStoppedRocks!;
            const numFit = Math.floor((1_000_000_000_000 - numStoppedRocks) / cycleNum);
            phantomHeight = (numFit * cycleHeight);
            numStoppedRocks += (numFit * cycleNum);
          }
        } else if (hitCounter < 2) {
          cache.add(JSON.stringify([rockIdx, jetIdx, rock.map(p => p.x)]));
        }
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
