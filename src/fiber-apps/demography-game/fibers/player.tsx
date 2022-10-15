import { useEffect, useRef } from "react";

import { BoundsApi, Box, useBounds } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

import { Mesh, Vector3 } from "three";

type Position3D = { x: number; y: number; z: number };

const Player = ({
  x,
  y,
  z,
  ...props
}: JSX.IntrinsicElements["group"] & Position3D) => {
  const box = useRef<Mesh>(null!);
  const vec = new Vector3(-1 * x, y, z);
  //
  const boundsApi: BoundsApi = useBounds(); // context provider by parent control
  //
  useEffect(() => {
    console.log("boundsApi", boundsApi, boundsApi?.getSize());
    if (boundsApi) boundsApi.refresh(box.current).clip().fit();
  }, [boundsApi]);
  //
  useFrame(() => box.current.position.lerp(vec, 0.1));
  //
  return (
    <group {...props}>
      <Box ref={box} castShadow>
        <meshLambertMaterial attach="material" color="white" />
      </Box>
    </group>
  );
};

export default Player;
