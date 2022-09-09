import { FC, useRef } from "react";

import { useFrame } from "@react-three/fiber";
import { Triplet, useHeightfield } from "@react-three/cannon";

import HeightmapGeometry from "../height-map-geometry/height-map-geometry.component";

export const Heightfield: FC<{
  elementSize: number;
  heights: number[][];
  position: Triplet;
  rotation: Triplet;
  autoRotate?: boolean;
}> = ({ elementSize, heights, position, rotation, autoRotate }) => {
  const ref = useRef<THREE.Object3D<Event>>(
    useHeightfield(() => ({
      args: [
        heights,
        {
          elementSize,
        },
      ],
      position,
      rotation,
    })) as any
  );

  useFrame(
    autoRotate
      ? (state, delta) => (ref.current.rotation.y += 0.001)
      : () => null
  );

  return (
    <mesh ref={ref as any} castShadow receiveShadow>
      <meshStandardMaterial color={"#44ffaa"} />
      <HeightmapGeometry heights={heights} elementSize={elementSize} />
    </mesh>
  );
};
