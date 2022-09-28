import { useEffect, useRef } from "react";

import { useFrame } from "@react-three/fiber";
import { BoundsApi, Box, useBounds } from "@react-three/drei";

import { Mesh, Vector3 } from "three";

type Position3D = { x: number; y: number; z: number };

const Player = ({
  x,
  y,
  z,
  ...props
}: JSX.IntrinsicElements["group"] & Position3D) => {
  const box = useRef<Mesh>(null!);
  //
  useFrame(() => box.current.position.lerp(new Vector3(x, y, z), 0.1));
  //
  const boundsApi: BoundsApi = useBounds(); // context provider by parent control
  //
  useEffect(() => {
    if (boundsApi) boundsApi.refresh().clip().fit();
  }, [boundsApi]);
  //
  return (
    <group {...props}>
      <Box ref={box} castShadow receiveShadow scale={[1, 1.05, 1]}>
        <meshPhongMaterial
          attach="material"
          color="white"
          opacity={0.15}
          transparent={true}
        />
      </Box>
    </group>
  );
};

export default Player;
