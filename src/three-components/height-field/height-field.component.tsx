import { useLayoutEffect, useRef } from "react";

import { useFrame } from "@react-three/fiber";
import { Triplet, useHeightfield } from "@react-three/cannon";

import HeightmapGeometry from "../height-map-geometry/height-map-geometry.component";
import { Texture } from "three";

export const Heightfield = (
  props: JSX.IntrinsicElements["mesh"] & {
    elementSize: number;
    heights: number[][];
    position: Triplet;
    rotation: Triplet;
    autoRotate?: boolean;
    showWireframe?: boolean;
    dataTextureHeightfield: Texture | null;
  }
) => {
  const {
    elementSize,
    heights,
    position,
    rotation,
    autoRotate,
    showWireframe,
    dataTextureHeightfield,
  } = props;
  //
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
  //

  useFrame(
    autoRotate
      ? (state, delta) => (ref.current.rotation.y += 0.001)
      : () => null
  );

  // useLayoutEffect(() => {
  //   if (dataTextureHeightfield) dataTextureHeightfield.needsUpdate = true;
  //   //
  //   //TODO: check warning    WebGL: INVALID_ENUM: texParameter: invalid parameter
  //   //
  // }, [dataTextureHeightfield]);

  //
  return (
    <mesh ref={ref as any} castShadow receiveShadow>
      {heights && (
        <HeightmapGeometry heights={heights} elementSize={elementSize} />
      )}

      {dataTextureHeightfield && (
        <meshStandardMaterial
          wireframe={showWireframe}
          colorWrite={true}
          map={dataTextureHeightfield}
        />
      )}
    </mesh>
  );
};
