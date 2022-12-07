import { readFileSync } from 'fs';

const inputFile = process.argv.slice(2)[0];

const terminalOutput = readFileSync(inputFile, 'utf8').split('\n').slice(1);
const maxSize = 100_000;

console.log(solve(terminalOutput, maxSize));

type File = { name: string, size: number };
type Directory = { name: string, contents: (File | Directory)[] };

function solve(terminalOutput: string[], maxSize: number): number {
  const root: Directory = getFilesystem(terminalOutput);
  return getAllDirs(root).map(getDirSize)
    .filter(size => size <= maxSize)
    .reduce((a, c) => a + c);
}

function getFilesystem(terminalOutput: string[]): Directory {
  const cdRegex = /^\$ cd (?<path>.+)$/;
  const fileRegex = /^(?<size>\d+) (?<name>.+)$/;
  const dirRegex = /^dir (?<name>.+)$/;
  let root: Directory = { name: '/', contents: [] };
  let currDir: Directory = root;
  for (const line of terminalOutput) {
    if (cdRegex.test(line)) {
      const { path } = line.match(cdRegex)!.groups!;
      currDir = getDir(root, currDir, path);
    }
    if (fileRegex.test(line)) {
      const { name, size } = line.match(fileRegex)!.groups!;
      currDir.contents.push({ name, size: +size });
    }
    if (dirRegex.test(line)) {
      const { name } = line.match(dirRegex)!.groups!;
      currDir.contents.push({ name, contents: [] });
    }
  }
  return root;
}

// TODO: absolute paths
function getDir(root: Directory, currDir: Directory, path: string): Directory {
  if (path === '..') return getParentDir(root, currDir)!;
  return currDir.contents.find(e => e.name === path) as Directory;
}

function getParentDir(dir: Directory, childDir: Directory): Directory | void {
  if (dir.contents.find(e => e === childDir)) return dir;
  for (const item of dir.contents) {
    if ('contents' in item) {
      const found = getParentDir(item, childDir);
      if (found) return found;
    }
  }
}

function getDirSize(dir: Directory): number {
  return dir.contents
    .map(item => ('contents' in item) ? getDirSize(item) : item.size)
    .reduce((a, c) => a + c);
}

function getAllDirs(dir: Directory, result: Directory[] = []): Directory[] {
  result.push(dir);
  for (const item of dir.contents) {
    if ('contents' in item) {
      getAllDirs(item, result);
    }
  }
  return result;
}