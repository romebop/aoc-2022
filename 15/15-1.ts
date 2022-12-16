import { readFileSync } from 'fs';
import { getManhattanDistance, getMergedRanges, isSamePoint, Point, Range } from '../util';

const inputFile = process.argv.slice(2)[0];

type Pair = { sensor: Point, beacon: Point };
const regex = /^Sensor at x=(?<sx>-?\d+), y=(?<sy>-?\d+): closest beacon is at x=(?<bx>-?\d+), y=(?<by>-?\d+)$/;
const pairs: Pair[] = readFileSync(inputFile, 'utf8').split('\n')
  .map(s => {
    const { sx, sy, bx, by } = s.match(regex)!.groups!;
    return {
      sensor: { x: +sx, y: +sy },
      beacon: { x: +bx, y: +by },
    };
  });
const y = 10;

console.log(solve(pairs, y));

function solve(pairs: Pair[], y: number): number {
  const noContainRanges: Range[] = [];
  for (const { sensor, beacon } of pairs) {
    const noContainRange = getNoContainRange(sensor, beacon, y);
    if (noContainRange) noContainRanges.push(noContainRange); 
  }
  return getMergedRanges(noContainRanges)
    .map(({ start, end }) => end - start + 1)
    .reduce((a, c) => a + c);
}

function getNoContainRange(sensor: Point, beacon: Point, y: number): Range | null {
  const mDist = getManhattanDistance(sensor, beacon);
  if (y < sensor.y - mDist || y > sensor.y + mDist) return null;
  const xOffset = mDist - Math.abs(sensor.y - y);
  return {
    start: sensor.x - xOffset + (isSamePoint({ x: sensor.x - xOffset, y }, beacon) ? 1 : 0),
    end: sensor.x + xOffset - (isSamePoint({ x: sensor.x + xOffset, y }, beacon) ? 1 : 0),
  };
}
