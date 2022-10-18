import { MutableRefObject, useRef, useState } from "react";

import { useHelper } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import {
  BoxHelper,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  ShapeGeometry,
} from "three";

import { lerp } from "three/src/math/MathUtils";
import { shapeFromCoords } from "../../../utils/d3d";

const colorHelper = new Color();

const CountryBorder = (
  props: JSX.IntrinsicElements["mesh"] & {
    countryBorderPoints: Array<[number, number]> | null;
    color?: Color;
    showFeatureBounds: boolean;
    capitalRef: MutableRefObject<Group> | undefined;
  }
) => {
  const { countryBorderPoints, color, showFeatureBounds, capitalRef } = props;
  //
  const ref = useRef<Mesh>(null!);
  const materialRef = useRef<MeshStandardMaterial>(null!);
  const [hovered, setHover] = useState(false);
  //
  useHelper(showFeatureBounds ? ref : undefined, BoxHelper, color);
  //
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.z = lerp(
        ref.current.position.z,
        hovered ? 0.5 : 0,
        0.1
      );
      if (capitalRef && capitalRef.current) {
        capitalRef.current.position.z = ref.current.position.z;
      }
      //
      if (materialRef.current)
        materialRef.current.color.lerp(
          colorHelper.set(hovered ? "#0000cf" : color || new Color("white")),
          hovered ? 1 : 0.1
        );
    }
  });

  //
  // handling 'hover'
  //
  const onPointerOut = (e: ThreeEvent<PointerEvent>) => setHover(false);
  const onPointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHover(true);
  };
  //

  const toWorldPosition = ([lat, lng]: [number, number]) =>
    [
      // -1 * lng,
      // -1 + 0.06,
      -1 * lat,
      -1 * lng,
    ] as [number, number];
  //
  //
  //
  const shape = countryBorderPoints
    ? //? shapeFromCoords(countryBorderPoints)
      shapeFromCoords(countryBorderPoints.map((p) => toWorldPosition(p)))
    : undefined;

  const geoRef = useRef<ShapeGeometry>(null!);
  //
  return countryBorderPoints && shape ? (
    <mesh
      ref={ref}
      {...props}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <shapeGeometry
        ref={geoRef}
        args={[
          shape,
          //shapeFromCoords(countryBorderPoints.map((p) => [-1 * p[0], p[1]])),
        ]}
      />
      <meshStandardMaterial
        ref={materialRef}
        side={DoubleSide}
        color={"white"}
      />
    </mesh>
  ) : null;
};

export default CountryBorder;
