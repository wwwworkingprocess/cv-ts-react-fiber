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
          colorHelper.set(hovered ? "red" : color || new Color("white")),
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
  return countryBorderPoints ? (
    <mesh
      ref={ref}
      {...props}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <shapeGeometry args={[shapeFromCoords(countryBorderPoints)]} />
      <meshStandardMaterial ref={materialRef} side={DoubleSide} />
    </mesh>
  ) : null;
};

export default CountryBorder;
