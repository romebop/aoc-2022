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
