import { readFileSync } from 'fs';
import { Point } from '../util';

const inputFile = process.argv.slice(2)[0];

const map: number[][] = readFileSync(inputFile, 'utf8').split('\n')
  .map(s => s.split('').map(Number));

type Direction = 'up' | 'down' | 'left' | 'right';

console.log(solve(map));

function solve(map: number[][]): number {
  return map.map((row, y) => row.map((_, x) => getScenicScore(map, { x, y }))
      .reduce((a, c) => a > c ? a : c)
    ).reduce((a, c) => a > c ? a : c);
}

function getScenicScore(map: number[][], coord: Point): number {
  return (['up', 'down', 'left', 'right'] as Direction[])
    .map(dir => getNumViewTrees(map, coord, dir))
    .reduce((a, c) => a * c);
}

function getNumViewTrees(map: number[][], { x, y }: Point, dir: Direction): number {
  const target = map[y][x];
  let count = 0;
  switch (dir) {
    case 'up': {
      for (let i = y - 1; i >= 0; i--) {
        count++;
        if (map[i][x] >= target) break;
      }
      break;
    }
    case 'down': {
      for (let i = y + 1; i < map.length; i++) {
        count++;
        if (map[i][x] >= target) break;
      }
      break;
    }
    case 'left': {
      for (let i = x - 1; i >= 0; i--) {
        count++;
        if (map[y][i] >= target) break;
      }
      break;
    }
    case 'right': {
      for (let i = x + 1; i < map[0].length; i++) {
        count++;
        if (map[y][i] >= target) break;
      }
      break;
    }
  }
  return count;
}
