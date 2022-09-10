import { Texture } from "three";

const TileMesh = (
  props: JSX.IntrinsicElements["mesh"] & {
    scalePositionY: number;
    positions: Float32Array;
    dataTexture?: Texture | undefined;
  }
) => {
  const { scalePositionY, positions, dataTexture, ...meshProps } = props;
  //
  return (
    <mesh
      castShadow
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[1, 1, scalePositionY]}
      {...meshProps}
    >
      {/* {positions.length && ( */}
      <planeBufferGeometry
        attach="geometry"
        args={[10, 10, 1200 - 1, 1200 - 1]}
      >
        <bufferAttribute
          attach="attributes-position"
          itemSize={3}
          array={positions}
          count={positions.length / 3}
        />
      </planeBufferGeometry>
      {/* )} */}
      {dataTexture && (
        <meshLambertMaterial attach="material" map={dataTexture} />
        // <meshStandardMaterial attach="material" map={dataTexture} />
      )}
    </mesh>
  );
};

export default TileMesh;
