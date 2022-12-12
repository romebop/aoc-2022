import { readFileSync } from 'fs';
import Heap from 'heap-js';
import { getAdjacentPoints, deserializePoint, serializePoint, Point } from '../util';

const inputFile = process.argv.slice(2)[0];

const map: string[][] = readFileSync(inputFile, 'utf8').split('\n').map(s => s.split(''));

console.log(solve(map));

function solve(map: string[][]): number {
  const start = getPoint(map, 'S')!;
  map[start.y][start.x] = 'a';
  const end = getPoint(map, 'E')!;
  map[end.y][end.x] = 'z';
  return dijkstra(map, start, end);
}

function dijkstra(map: string[][], start: Point, end: Point): number {
  const distances = new Map<string, number>();
  const remaining = new Heap((a: string, b: string) => (
    distances.get(a)! > distances.get(b)! ? 1 : -1
  ));
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {
      distances.set(serializePoint({ x, y }), Infinity);
    }
  }
  distances.set(serializePoint(start), 0);
  remaining.push(serializePoint(start));
  while (remaining.length) {
    const sp = remaining.pop()!;
    const p = deserializePoint(sp);
    for (const n of getAdjacentPoints(map, p)) {
      if (!isValidStep(map, n, p)) continue;
      const sn = serializePoint(n);
      const newPathVal = distances.get(sp)! + 1;
      const oldPathVal = distances.get(sn)!;
      if (newPathVal < oldPathVal) {
        distances.set(sn, newPathVal);
        remaining.push(sn);
      }
    }
  }
  return distances.get(serializePoint(end))!;
}

function isValidStep(map: string[][], { x: currX, y: currY }: Point, { x: prevX, y: prevY }: Point): boolean {
  return map[currY][currX].charCodeAt(0) <= (map[prevY][prevX].charCodeAt(0) + 1);
}

function getPoint(map: string[][], marker: string): Point | void {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {
      if (map[y][x] === marker) return { x, y };
    }
  }
}
