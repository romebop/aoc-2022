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

export function getAdjacentPoints(map: any[][], { x, y }: Point): Point[] {
  const adjacentPoints: Point[] = [];
  if (x > 0) adjacentPoints.push({ x: x - 1, y });
  if (x < map[0].length - 1) adjacentPoints.push({ x: x + 1, y });
  if (y > 0) adjacentPoints.push({ x, y: y - 1 });
  if (y < map.length - 1) adjacentPoints.push({ x, y: y + 1 });
  return adjacentPoints;
}

export function serializePoint({ x, y }: Point): string {
  return `(${x},${y})`;
}

export function deserializePoint(str: string): Point {
  const [x, y] = str.slice(1, -1).split(',').map(e => +e);
  return { x, y };
}