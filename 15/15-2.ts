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
const searchRange = { start: 0, end: 4_000_000 };

console.log(solve(pairs, searchRange));

function solve(pairs: Pair[], searchRange: Range): number | void {
  for (let y = searchRange.start; y <= searchRange.end; y++) {
    const noContainRanges: Range[] = [];
    for (const { sensor, beacon } of pairs) {
      const noContainRange = getNoContainRange(sensor, beacon, y);
      if (noContainRange) noContainRanges.push(noContainRange); 
    }
    const restrictedRanges = getRestrictedRanges(
      connectRanges(getMergedRanges(noContainRanges)),
      searchRange,
    );
    if (restrictedRanges.length > 1) {
      const distressBeacon = { x: restrictedRanges[0].end + 1, y };
      return getTuningFrequency(distressBeacon);
    }
  }
}

function getNoContainRange(sensor: Point, beacon: Point, y: number): Range | null {
  const mDist = getManhattanDistance(sensor, beacon);
  if (y < sensor.y - mDist || y > sensor.y + mDist) return null;
  const xOffset = mDist - Math.abs(sensor.y - y);
  return { start: sensor.x - xOffset, end: sensor.x + xOffset };
}

function getRestrictedRanges(ranges: Range[], searchRange: Range): Range[] {
  const restrictedRanges: Range[] = [];
  for (const range of ranges) {
    if (range.end < searchRange.start && range.start > searchRange.end) continue;
    const start = range.start < searchRange.start ? searchRange.start : range.start;
    const end = range.end > searchRange.end ? searchRange.end : range.end;
    restrictedRanges.push({ start, end });
  }
  return restrictedRanges;
}

// Sensors and beacons always exist at integer coordinates.
function connectRanges(ranges: Range[]): Range[] {
  const connectedRanges: Range[] = [];
  let currRange = { ...ranges[0] };
  for (let i = 1; i < ranges.length; i++) {
    if (currRange.end === ranges[i].start - 1) {
      currRange.end = ranges[i].end;
    } else {
      connectedRanges.push(currRange);
      currRange = { ...ranges[i] };
    }
  }
  connectedRanges.push(currRange);
  return connectedRanges;
}

function getTuningFrequency(p: Point): number {
  return p.x * 4_000_000 + p.y;
}