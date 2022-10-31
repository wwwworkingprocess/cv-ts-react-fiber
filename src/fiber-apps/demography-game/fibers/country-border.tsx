import { useMemo, useRef, useState } from "react";

import { ThreeEvent, useFrame } from "@react-three/fiber";
import { Color, DoubleSide, Mesh, MeshStandardMaterial } from "three";

import { shapeFromCoords } from "../../../utils/d3d";

const colorHelper = new Color();

const COLOR_WHITE = new Color("white");
const COLOR_HOVER = new Color("#0000cf");

const CountryBorder = (
  props: JSX.IntrinsicElements["mesh"] & {
    points: Array<[number, number]> | null;
    color?: Color;
  }
) => {
  const { points, color } = props;
  //
  const ref = useRef<Mesh>(null!);
  const materialRef = useRef<MeshStandardMaterial>(null!);
  const [hovered, setHover] = useState(false);

  //
  //
  //
  const shape = useMemo(() => {
    const toWorldPosition = ([lat, lng]: [number, number]) =>
      [-1 * lat, -1 * lng] as [number, number];
    //
    return points ? (
      <shapeGeometry
        args={[shapeFromCoords(points.map((p) => toWorldPosition(p)))]}
      />
    ) : null;
  }, [points]);

  //
  //
  //
  useFrame((state) => {
    if (ref.current) {
      if (materialRef.current)
        materialRef.current.color.lerp(
          colorHelper.set(hovered ? COLOR_HOVER : color || COLOR_WHITE),
          hovered ? 0.3 : 0.1
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
  return points && shape ? (
    <mesh
      ref={ref}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      {...props}
    >
      {shape}
      <meshStandardMaterial
        ref={materialRef}
        side={DoubleSide}
        color={COLOR_WHITE}
      />
    </mesh>
  ) : null;
};

export default CountryBorder;
