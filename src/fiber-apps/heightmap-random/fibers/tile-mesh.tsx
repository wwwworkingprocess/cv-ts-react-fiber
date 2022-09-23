import { Texture } from "three";

const TileMesh = (
  props: JSX.IntrinsicElements["mesh"] & {
    scalePositionY: number;
    positions: Float32Array; // positions of vertices or empty array
    dataTexture: Texture | null;
    wSegments: number;
    hSegments: number;
  }
) => {
  const {
    scalePositionY,
    positions,
    dataTexture,
    wSegments,
    hSegments,
    ...meshProps
  } = props;
  //
  // const [wSegments, hSegments] = [1200 - 1, 1200 - 1]; // 1200x1200 vertices
  //
  return (
    <mesh
      castShadow
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[1, 1, scalePositionY]}
      {...meshProps}
    >
      <planeBufferGeometry
        attach="geometry"
        args={[1, 1, wSegments, hSegments]}
      >
        <bufferAttribute
          attach="attributes-position"
          itemSize={3}
          array={positions}
          count={positions.length / 3}
        />
      </planeBufferGeometry>
      {dataTexture && (
        <meshLambertMaterial attach="material" map={dataTexture} />
      )}
    </mesh>
  );
};

export default TileMesh;
