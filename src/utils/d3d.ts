import { Shape, Vector2 } from "three";

export const shapeFromCoords = (coords: Array<[number, number]>) =>
  new Shape(coords.map((c) => new Vector2(...c)));

export const shapeRoundedRectangle = (
  width: number,
  height: number,
  radius: number
) => {
  const shape = new Shape();
  //
  shape.moveTo(-(width / 2), -(height / 2) + radius);
  //
  shape.lineTo(-(width / 2), height / 2 - radius);
  shape.quadraticCurveTo(
    -(width / 2),
    height / 2,
    -(width / 2) + radius,
    height / 2
  );
  //
  shape.lineTo(width / 2 - radius, height / 2);
  shape.quadraticCurveTo(width / 2, height / 2, width / 2, height / 2 - radius);
  //
  shape.lineTo(width / 2, -(height / 2) + radius);
  shape.quadraticCurveTo(
    width / 2,
    -(height / 2),
    width / 2 - radius,
    -(height / 2)
  );
  //
  shape.lineTo(-(width / 2) + radius, -(height / 2));
  shape.quadraticCurveTo(
    -(width / 2),
    -(height / 2),
    -(width / 2),
    -(height / 2) + radius
  );
  //
  return shape;
};
