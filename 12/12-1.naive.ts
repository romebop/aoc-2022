import { readFileSync } from 'fs';
import { getAdjacentPoints, serializePoint, Point } from '../util';

const inputFile = process.argv.slice(2)[0];

const map: string[][] = readFileSync(inputFile, 'utf8').split('\n').map(s => s.split(''));

console.log(solve(map));

function solve(map: string[][]): number {
  const startPos = getStartPos(map)!;
  return getAdjacentPoints(map, startPos)
    .map(pos => getFewestSteps(map, pos, startPos, new Set([serializePoint(startPos)])))
    .reduce((a, c) => a < c ? a : c);
}

function getFewestSteps(map: string[][], currPos: Point, prevPos: Point, visitLog: Set<string>): number {
  if (
    visitLog.has(serializePoint(currPos))
    || !isValidStep(map, currPos, prevPos)
  ) return Infinity;
  if (map[currPos.y][currPos.x] === 'E') return 1;
  visitLog.add(serializePoint(currPos));
  return getAdjacentPoints(map, currPos)
    .map(pos => 1 + getFewestSteps(map, pos, currPos, new Set(visitLog)))
    .reduce((a, c) => a < c ? a : c);
}

function isValidStep(map: string[][], { x: currX, y: currY }: Point, { x: prevX, y: prevY }: Point): boolean {
  const prevLetter = map[prevY][prevX] === 'S' ? 'a' : map[prevY][prevX];
  const currLetter = map[currY][currX] === 'S' ? 'a' : (map[currY][currX] === 'E' ? 'z' : map[currY][currX]);
  return currLetter.charCodeAt(0) <= (prevLetter.charCodeAt(0) + 1);
}

function getStartPos(map: string[][]): Point | void {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {
      if (map[y][x] === 'S') return { x, y };
    }
  }
}

// function getMapStr(map: string[][], markers?: Point[]): string {
//   const copy: string[][] = JSON.parse(JSON.stringify(map));
//   if (markers) markers.forEach(({ x, y }) => copy[y][x] = '.');
//   return copy.reduce((a, c) => a + `${c.reduce((a, c) => a + ' ' + c)}\n\n`, '');
// }
