import { readFileSync } from 'fs';
import { getManhattanDistance, getMergedIntervals, Interval, Point } from '../util';

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
const searchInterval = { start: 0, end: 4_000_000 };

console.log(solve(pairs, searchInterval));

function solve(pairs: Pair[], searchInterval: Interval): number | void {
  for (let y = searchInterval.start; y <= searchInterval.end; y++) {
    const noContainIntervals: Interval[] = [];
    for (const { sensor, beacon } of pairs) {
      const noContainInterval = getNoContainInterval(sensor, beacon, y);
      if (noContainInterval) noContainIntervals.push(noContainInterval); 
    }
    const restrictedRanges = getRestrictedRanges(
      connectIntervals(getMergedIntervals(noContainIntervals)),
      searchInterval,
    );
    if (restrictedRanges.length > 1) {
      const distressBeacon = { x: restrictedRanges[0].end + 1, y };
      return getTuningFrequency(distressBeacon);
    }
  }
}

function getNoContainInterval(sensor: Point, beacon: Point, y: number): Interval | null {
  const mDist = getManhattanDistance(sensor, beacon);
  if (y < sensor.y - mDist || y > sensor.y + mDist) return null;
  const xOffset = mDist - Math.abs(sensor.y - y);
  return { start: sensor.x - xOffset, end: sensor.x + xOffset };
}

function getRestrictedRanges(intervals: Interval[], searchInterval: Interval): Interval[] {
  const restrictedIntervals: Interval[] = [];
  for (const interval of intervals) {
    if (interval.end < searchInterval.start && interval.start > searchInterval.end) continue;
    const start = interval.start < searchInterval.start ? searchInterval.start : interval.start;
    const end = interval.end > searchInterval.end ? searchInterval.end : interval.end;
    restrictedIntervals.push({ start, end });
  }
  return restrictedIntervals;
}

// Sensors and beacons always exist at integer coordinates.
function connectIntervals(intervals: Interval[]): Interval[] {
  const connectedIntervals: Interval[] = [];
  let currInterval = { ...intervals[0] };
  for (let i = 1; i < intervals.length; i++) {
    if (currInterval.end === intervals[i].start - 1) {
      currInterval.end = intervals[i].end;
    } else {
      connectedIntervals.push(currInterval);
      currInterval = { ...intervals[i] };
    }
  }
  connectedIntervals.push(currInterval);
  return connectedIntervals;
}

function getTuningFrequency(p: Point): number {
  return p.x * 4_000_000 + p.y;
}