export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  return Array(Math.ceil(array.length / chunkSize))
    .fill(null)
    .map((_, idx) => idx * chunkSize)
    .map(start => array.slice(start, start + chunkSize));
}

export function getIntersect<T>(arrays: T[][]): T[] {
  return Array.from(
    arrays.map(a => new Set(a))
      .reduce((a, c) => {
        return new Set(Array.from(a).filter(x => c.has(x)));
      })
  );
}

export function getRange(start: number, end: number): number[] {
  const result: number[] = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
}

export type Point = { x: number; y: number; };
export type Range = { min: number; max: number };
export type Bounds = { x: Range, y: Range };

export function getAdjacentPoints(map: any[][], { x, y }: Point): Point[] {
  const adjacentPoints: Point[] = [];
  if (x > 0) adjacentPoints.push({ x: x - 1, y });
  if (x < map[0].length - 1) adjacentPoints.push({ x: x + 1, y });
  if (y > 0) adjacentPoints.push({ x, y: y - 1 });
  if (y < map.length - 1) adjacentPoints.push({ x, y: y + 1 });
  return adjacentPoints;
}

export function serializePoint({ x, y }: Point): string {
  return `(${x}, ${y})`;
}

export function deserializePoint(str: string): Point {
  const [x, y] = str.slice(1, -1).split(', ').map(e => +e);
  return { x, y };
}

export function isSamePoint(p1: Point, p2: Point): boolean {
  return p1.x === p2.x && p1.y === p2.y;
}

export function getManhattanDistance(p1: Point, p2: Point): number {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

export type Interval = { start: number, end: number };

export function getMergedIntervals(intervals: Interval[]): Interval[] {
  const sortedIntervals = (JSON.parse(JSON.stringify(intervals)) as Interval[])
    .sort((a, b) => a.start - b.start);
  const mergedIntervals: Interval[] = [sortedIntervals[0]];
  for (const interval of sortedIntervals.slice(1)) {
    if (mergedIntervals.at(-1)!.start <= interval.start && interval.start <= mergedIntervals.at(-1)!.end) {
      mergedIntervals.at(-1)!.end = Math.max(mergedIntervals.at(-1)!.end, interval.end);
    } else {
      mergedIntervals.push(interval);
    }
  }
  return mergedIntervals;
}
