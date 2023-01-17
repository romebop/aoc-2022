import { Range } from '../util';

export type Point = { x: number, y: number, z: number };
export type Bounds = { x: Range, y: Range, z: Range };
export type Vector = [number, number, number];
export type Matrix = [
  [number, number , number],
  [number, number , number],
  [number, number , number],
];
