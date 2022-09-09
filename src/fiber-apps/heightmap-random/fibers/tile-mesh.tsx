import { Texture } from "three";

const TileMesh = (
  props: JSX.IntrinsicElements["mesh"] & {
    scalePositionY: number;
    positions: Float32Array;
    dataTexture?: Texture | undefined;
  }
) => {
  const { scalePositionY, positions, dataTexture } = props;
  //
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, scalePositionY]}>
      {positions.length && (
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
      )}
      <meshStandardMaterial attach="material" map={dataTexture} />
    </mesh>
  );
};

export default TileMesh;