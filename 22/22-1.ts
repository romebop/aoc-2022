import { readFileSync } from 'fs';
import { Point } from '../util';

type Tile = ' ' | '.' | '#';
type InstructionType = 'move' | 'turn';
type Direction =  'U' | 'D' | 'L' | 'R';
type Instruction = { type: InstructionType, steps?: number, direction?: Direction };
const inputFile = process.argv.slice(2)[0];
const [mapStr, pathStr] = readFileSync(inputFile, 'utf8').split('\n\n');
const map = getMap(mapStr);
const path = getPath(pathStr);

console.log(solve(map, path));

function solve(map: Tile[][], path: Instruction[]): number {
  let pos: Point = getStartPos(map)!;
  let dir: Direction = 'R';
  // console.log(getMapStr(map, pos, dir));
  for (const instr of path) {
    // console.log(`\n\ninstr.type: ${instr.type}, pos: ${serializePoint(pos)}`);
    if (instr.type === 'move') {
      for (let i = 0; i < instr.steps!; i++) {
        pos = takeStep(map, pos, dir)!;
      }
    }
    if (instr.type === 'turn') {
      dir = makeTurn(dir, instr.direction!);
    }
    // console.log(getMapStr(map, pos, dir));
  }
  const pointMap: Record<Direction, number> = { R: 0, D: 1, L: 2, U: 3 };
  return 1000 * (pos.y + 1) + 4 * (pos.x + 1) + pointMap[dir];
}

function getMap(mapStr: string): Tile[][] {
  const rowSplit = mapStr.split('\n');
  const maxRowLen = Math.max(...rowSplit.map(s => s.length))
  return rowSplit.map(s => s.padEnd(maxRowLen, ' ').split('') as Tile[]);
}

function getMapStr(map: Tile[][], pos: Point, dir: Direction, testPos?: Point): string {
  const copy: string[][] = JSON.parse(JSON.stringify(map));
  if (dir === 'U') copy[pos.y][pos.x] = '^';
  if (dir === 'D') copy[pos.y][pos.x] = 'v';
  if (dir === 'L') copy[pos.y][pos.x] = '<';
  if (dir === 'R') copy[pos.y][pos.x] = '>';
  if (testPos) copy[testPos.y][testPos.x] = 'o';
  return copy.map(r => r.join('')).join('\n');
}

function getPath(pathStr: string): Instruction[] | any {
  return pathStr.match(/\d+|(L|R)+/g)!
    .map(s => {
      return isNaN(Number(s))
        ? { type: 'turn', direction: s }
        : { type: 'move', steps: Number(s) };
    });
}

function getStartPos(map: Tile[][]): Point | void {
  for (let x = 0; x < map[0].length; x++) {
    if (map[0][x] === '.') return { x, y: 0 };
  }
}

function takeStep(map: Tile[][], pos: Point, dir: Direction): Point | void {
  let nextPos = getNextPos(map, pos, dir);
  while (map[nextPos.y][nextPos.x] === ' ') {
    nextPos = getNextPos(map, nextPos, dir);
  }
  if (map[nextPos.y][nextPos.x] === '.') return nextPos;
  if (map[nextPos.y][nextPos.x] === '#') return pos;
}

function getNextPos(map: Tile[][], pos: Point, dir: Direction): Point {
  let nextPos: Point;
  if (dir === 'U') nextPos = { x: pos.x, y: pos.y - 1 };
  if (dir === 'D') nextPos = { x: pos.x, y: pos.y + 1 };
  if (dir === 'L') nextPos = { x: pos.x - 1, y: pos.y };
  if (dir === 'R') nextPos = { x: pos.x + 1, y: pos.y };
  if (nextPos!.x < 0) nextPos = { ...nextPos!, x: map[0].length - 1 };
  if (nextPos!.x >= map[0].length) nextPos = { ...nextPos!, x: 0 };
  if (nextPos!.y < 0) nextPos = { ...nextPos!, y: map.length - 1 };
  if (nextPos!.y >= map.length) nextPos = { ...nextPos!, y: 0 };
  return nextPos!;
}

function makeTurn(currDir: Direction, turnDir: Direction): Direction {
  const dirs: Direction[] = ['U', 'R', 'D', 'L'];
  const currDirIdx = dirs.indexOf(currDir);
  let newDirIdx: number;
  if (turnDir === 'R') newDirIdx = (currDirIdx + 1) % dirs.length;
  if (turnDir === 'L') newDirIdx = currDirIdx - 1;
  return dirs.at(newDirIdx!)!;
}
