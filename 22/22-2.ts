import { readFileSync } from 'fs';
import { Bounds, deserializePoint, Point, serializePoint } from '../util';
import { Vector, Matrix } from '../util/3d';

type Sibling = { id: string, steps: Direction[] };
type Adjacent = { pos: Point, direction: Direction };
type Border = { id: string, orientation: Direction };
type SquareBorders = Record<Direction, Border>;
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
  const cubeFaces = getCubeFaces(map);
  let pos: Point = getFirstPos(map, ['.'])!;
  let dir: Direction = 'R';
  // console.log(getMapStr(map, pos, dir));
  for (const instr of path) {
    // console.log(`\n\ninstr.type: ${instr.type}, pos: ${serializePoint(pos)}`);
    if (instr.type === 'move') {
      for (let i = 0; i < instr.steps!; i++) {
        ({ pos, dir } = takeStep(map, cubeFaces, pos, dir)!);
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

function getFirstPos(map: Tile[][], validTiles: Tile[]): Point | void {
  for (let x = 0; x < map[0].length; x++) {
    if (validTiles.includes(map[0][x])) return { x, y: 0 };
  }
}

function takeStep(map: Tile[][], cubeFaces: Record<string, SquareBorders>, pos: Point, dir: Direction): { pos: Point, dir: Direction } | void {
  const nextState = getNextState(map, cubeFaces, pos, dir)!;
  if (map[nextState.pos.y][nextState.pos.x] === '.') return nextState;
  if (map[nextState.pos.y][nextState.pos.x] === '#') return { pos, dir };
}

function getNextState(map: Tile[][], cubeFaces: Record<string, SquareBorders>, pos: Point, dir: Direction): { pos: Point, dir: Direction } | void {
  const faceId = getFaceId(map, pos);
  const bounds = getBounds(map, faceId);
  const len = getFaceLen(map);
  const xOffset = pos.x - bounds.x.min;
  const yOffset = pos.y - bounds.y.min;
  const borders = cubeFaces[faceId];
  if (dir === 'U') {
    if (pos.y === bounds.y.min) return teleportPos(map, borders.U.id, getSide('U', borders.U.orientation), xOffset);
    return { pos: { x: pos.x, y: pos.y - 1 }, dir };
  }
  if (dir === 'D') {
    if (pos.y === bounds.y.max) return teleportPos(map, borders.D.id, getSide('D', borders.D.orientation), (len - 1) - xOffset);
    return { pos: { x: pos.x, y: pos.y + 1 }, dir };
  }
  if (dir === 'L') {
    if (pos.x === bounds.x.min) return teleportPos(map, borders.L.id, getSide('L', borders.L.orientation), (len - 1) - yOffset);
    return { pos: { x: pos.x - 1, y: pos.y }, dir };
  }
  if (dir === 'R') {
    if (pos.x === bounds.x.max) return teleportPos(map, borders.R.id, getSide('R', borders.R.orientation), yOffset);
    return { pos: { x: pos.x + 1, y: pos.y }, dir };
  }
}

function teleportPos(map: Tile[][], faceId: string, side: Direction, offset: number): { pos: Point, dir: Direction } {
  const b = getBounds(map, faceId);
  const len = getFaceLen(map);
  const oppositeDirectionMap = getOppositeDirectionMap();
  let pos: Point;
  if (side === 'U') pos = { x: b.x.min + (len - 1) - offset, y: b.y.min };
  if (side === 'D') pos = { x: b.x.min + offset, y: b.y.max };
  if (side === 'L') pos = { x: b.x.min, y: b.y.min + offset };
  if (side === 'R') pos = { x: b.x.max, y: b.y.min + (len - 1) - offset };
  return { pos: pos!, dir: oppositeDirectionMap[side] };
}

function getSide(originSide: Direction, orientation: Direction): Direction {
  const dirLoop = getDirections();
  const oppositeDirectionMap = getOppositeDirectionMap();
  let orientationIdx = dirLoop.indexOf(orientation);
  let trackIdx = dirLoop.indexOf(oppositeDirectionMap[originSide]);
  while (dirLoop[orientationIdx] !== 'U') {
    trackIdx = (trackIdx + 1) % dirLoop.length;
    orientationIdx = (orientationIdx + 1) % dirLoop.length;
  }
  return dirLoop[trackIdx];
}

function makeTurn(currDir: Direction, turnDir: Direction): Direction {
  const dirs: Direction[] = getDirections();
  const currDirIdx = dirs.indexOf(currDir);
  let newDirIdx: number;
  if (turnDir === 'R') newDirIdx = (currDirIdx + 1) % dirs.length;
  if (turnDir === 'L') newDirIdx = currDirIdx - 1;
  return dirs.at(newDirIdx!)!;
}

function getCubeFaces(map: Tile[][]): Record<string, SquareBorders> {
  const len = getFaceLen(map);
  const startPos = getFirstPos(map, ['.', '#'])!;
  const queue: Point[] = [startPos];
  const visitLog = new Set<string>();
  const cubeFaces: Record<string, SquareBorders> = {};
  while (queue.length) {
    const p = queue.pop()!;
    const sp = serializePoint(p);
    visitLog.add(sp);
    const siblings = getSiblings(map, p, len);
    cubeFaces[sp] = {
      U: getBorder('U', siblings)!,
      D: getBorder('D', siblings)!,
      L: getBorder('L', siblings)!,
      R: getBorder('R', siblings)!,
    };
    for (const { pos: a } of getAdjacents(map, p, len)) {
      if (visitLog.has(serializePoint(a)) || map[a.y][a.x] === ' ') continue;
      queue.push(a);
    }
  }
  return cubeFaces;
}

function getAdjacents(map: Tile[][], { x, y }: Point, offset = 1): Adjacent[] {
  const adjacents: Adjacent[] = [];
  if (y - offset >= 0) adjacents.push({ pos: { x, y: y - offset }, direction: 'U' });
  if (y + offset < map.length) adjacents.push({ pos: { x, y: y + offset }, direction: 'D' });
  if (x - offset >= 0) adjacents.push({ pos: { x: x - offset, y }, direction: 'L' });
  if (x + offset < map[0].length) adjacents.push({ pos: { x: x + offset, y }, direction: 'R' });
  return adjacents;
}

function getSiblings(map: Tile[][], p: Point, offset: number): Sibling[] {
  const siblings: Sibling[] = [];
  siblingWalk(map, p, [], siblings, offset);
  return siblings.slice(1);
}

function siblingWalk(map: Tile[][], p: Point, steps: Direction[], siblings: Sibling[], offset = 1, visitLog = new Set<string>): void {
  if (visitLog.has(serializePoint(p))) return;
  visitLog.add(serializePoint(p));
  siblings.push({ id: serializePoint(p), steps: [...steps] });
  for (const { pos: a, direction } of getAdjacents(map, p, offset)) {
    if (map[a.y][a.x] === ' ') continue;
    siblingWalk(map, a, [...steps, direction], siblings, offset, visitLog);
  }
}

function getBorder(direction: Direction, siblings: Sibling[]): Border | void {
  const faceVectorMap = getFaceVectorMap();
  for (const { id, steps } of siblings) {
    const destinationFace = getFace(applyRotations(steps), faceVectorMap[direction]);
    const targetFace = getFace(applyRotations([direction]), faceVectorMap[direction]);
    if (isSameVector(destinationFace, targetFace)) {
      return { id, orientation: getOrientation(steps)! };
    }
  }
}

function getOrientation(steps: Direction[]): Direction | void {
  const roundTrip: Direction[] = [...steps, getLastStep(steps)!];
  const faceVectorMap = getFaceVectorMap();
  const upVector = getFace(applyRotations(roundTrip), [0, 1, 0]);
  const dirLoop = getDirections();
  for (const d of dirLoop) {
    if (isSameVector(upVector, faceVectorMap[d])) {
      let targetIdx = 0;
      let originIdx = dirLoop.indexOf(d);
      while (dirLoop[originIdx] !== 'U') {
        originIdx = (originIdx + 1) % dirLoop.length;
        targetIdx = (targetIdx + 1) % dirLoop.length;
      }
      return dirLoop[targetIdx];
    }
  }
}

function getLastStep(steps: Direction[]): Direction | void {
  const m = applyRotations(steps);
  if (isSameVector(getFace(m, [0, 0, -1]), [  0,  1, 0])) return 'U';
  if (isSameVector(getFace(m, [0, 0, -1]), [  0, -1, 0])) return 'D';
  if (isSameVector(getFace(m, [0, 0, -1]), [ -1,  0, 0])) return 'L';
  if (isSameVector(getFace(m, [0, 0, -1]), [  1,  0, 0])) return 'R';
}

function applyRotations(steps: Direction[]): Matrix {
  const rotationMatrixMap = getRotationMatrixMap();
  let m = getIdentityMatrix();
  for (const s of steps) {
    m = multiplyMatrices(rotationMatrixMap[s], m);
  }
  return m;
}

function multiplyMatrices(m1: Matrix, m2: Matrix): Matrix {
  const result: Matrix = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        result[i][j] += m1[i][k] * m2[k][j];
      }
    }
  }
  return result;
}

function getFace(m: Matrix, v: Vector): Vector {
  return [
    m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
    m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
    m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
  ];
}

function isSameVector(v1: Vector, v2: Vector): boolean {
  return (v1[0] === v2[0]) && (v1[1] === v2[1]) && (v1[2] === v2[2]);
}

function getIdentityMatrix(): Matrix {
  return [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
}

function getFaceVectorMap(): Record<Direction, Vector> {
  return {
    U: [ 0,  1,  0],
    D: [ 0, -1,  0],
    L: [-1,  0,  0],
    R: [ 1,  0,  0],
  };
}

function getRotationMatrixMap(): Record<Direction, Matrix> {
  return {
    U: [
      [ 1,  0,  0],
      [ 0,  0,  1],
      [ 0, -1,  0],    
    ],
    D: [
      [ 1,  0,  0],
      [ 0,  0, -1],
      [ 0,  1,  0],    
    ],
    L: [
      [ 0,  0, -1],
      [ 0,  1,  0],
      [ 1,  0,  0],
    ],
    R: [
      [ 0,  0,  1],
      [ 0,  1,  0],
      [-1,  0,  0],  
    ],
  };
}

function getDirections(): Direction[] {
  return ['U', 'R', 'D', 'L'];
}

function getFaceLen(map: Tile[][]): number {
  return Math.max(map.length, map[0].length) / 4;
}

function getFaceId(map: Tile[][], p: Point): string {
  const len = getFaceLen(map);
  return serializePoint({
    x: Math.floor(p.x / len) * len,
    y: Math.floor(p.y / len) * len,
  });
}

function getBounds(map: Tile[][], id: string): Bounds {
  const p = deserializePoint(id);
  const len = getFaceLen(map);
  return {
    x: { min: p.x, max: p.x + len - 1 },
    y: { min: p.y, max: p.y + len - 1 },
  };
}

function getOppositeDirectionMap(): Record<Direction, Direction> {
  return {
    U: 'D',
    D: 'U',
    L: 'R',
    R: 'L',
  };
}