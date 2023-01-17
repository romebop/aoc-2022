import { readFileSync } from 'fs';

const decryptionKey = 811589153;
const inputFile = process.argv.slice(2)[0];
const list: number[] = readFileSync(inputFile, 'utf8').split('\n').map(Number).map(n => n * decryptionKey);

console.log(solve(list, 10));

function solve(list: number[], mixCount: number): number {
  type Item = { val: number, originIdx: number };
  const trackedList: Item[] = list.map((e, i) => ({ val: e, originIdx: i }));
  for (let currCount = 1; currCount <= mixCount; currCount++) {
    for (let i = 0; i < trackedList.length; i++) {
      const itemIdx = trackedList.findIndex(e => e.originIdx === i);
      const item = trackedList[itemIdx];
      trackedList.splice(itemIdx, 1);
      let startIdx = itemIdx - 1;
      if (startIdx < 0) startIdx = trackedList.length - 1;
      let endIdx = (startIdx + item.val) % trackedList.length;
      if (endIdx < 0) endIdx += trackedList.length;
      trackedList.splice(endIdx + 1, 0, item);
    }
  }
  return getGroveCoord(trackedList.map(e => e.val));
}

function getGroveCoord(list: number[]): number {
  const zeroIdx = list.indexOf(0);
  return [1000, 2000, 3000].map(n => list[(zeroIdx + n) % list.length])
    .reduce((a, c) => a + c);
}
