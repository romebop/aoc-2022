import { readFileSync } from 'fs';
import { getManhattanDistance, getMergedIntervals, Interval, isSamePoint, Point } from '../util';

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
const y = 2_000_000;

console.log(solve(pairs, y));

function solve(pairs: Pair[], y: number): number {
  const noContainIntervals: Interval[] = [];
  for (const { sensor, beacon } of pairs) {
    const noContainInterval = getNoContainInterval(sensor, beacon, y);
    if (noContainInterval) noContainIntervals.push(noContainInterval); 
  }
  return getMergedIntervals(noContainIntervals)
    .map(({ start, end }) => end - start + 1)
    .reduce((a, c) => a + c);
}

function getNoContainInterval(sensor: Point, beacon: Point, y: number): Interval | null {
  const mDist = getManhattanDistance(sensor, beacon);
  if (y < sensor.y - mDist || y > sensor.y + mDist) return null;
  const xOffset = mDist - Math.abs(sensor.y - y);
  return {
    start: sensor.x - xOffset + (isSamePoint({ x: sensor.x - xOffset, y }, beacon) ? 1 : 0),
    end: sensor.x + xOffset - (isSamePoint({ x: sensor.x + xOffset, y }, beacon) ? 1 : 0),
  };
}
