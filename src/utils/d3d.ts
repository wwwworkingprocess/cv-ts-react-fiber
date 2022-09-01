import { Shape, Vector2 } from "three";

export const shapeFromCoords = (coords: Array<[number, number]>) =>
  new Shape(coords.map((c) => new Vector2(...c)));
