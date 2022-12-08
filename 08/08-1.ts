import { readFileSync } from 'fs';

const inputFile = process.argv.slice(2)[0];

const map: number[][] = readFileSync(inputFile, 'utf8').split('\n')
  .map(s => s.split('').map(Number));

type Point = { x: number, y: number };
type Direction = 'up' | 'down' | 'left' | 'right';

console.log(solve(map));

function solve(map: number[][]): number {
  return map.map((row, y) => row.map((_, x) => isVisible(map, { x, y }))
      .reduce((a, c) => a + +c, 0)
    ).reduce((a, c) => a + +c, 0);
}

function isVisible(map: number[][], coord: Point): boolean {
  const { x, y } = coord;
  return (x === 0 || x === map[0].length - 1 || y === 0 || y === map.length - 1)
    || (['up', 'down', 'left', 'right'] as Direction[])
      .map(dir => getTrees(map, coord, dir).every(t => t < map[y][x]))
      .reduce((a, c) => a || c);
}

function getTrees(map: number[][], { x, y }: Point, dir: Direction): number[] {
  const trees: number[] = [];
  switch (dir) {
    case 'up': {
      for (let i = y - 1; i >= 0; i--) {
        trees.push(map[i][x]);
      }
      break;
    }
    case 'down': {
      for (let i = y + 1; i < map.length; i++) {
        trees.push(map[i][x]);
      }
      break;
    }
    case 'left': {
      for (let i = x - 1; i >= 0; i--) {
        trees.push(map[y][i]);
      }
      break;
    }
    case 'right': {
      for (let i = x + 1; i < map[0].length; i++) {
        trees.push(map[y][i]);
      }
      break;
    }
  }
  return trees;
}
