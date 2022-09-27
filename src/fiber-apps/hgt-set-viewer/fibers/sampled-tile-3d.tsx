import { DataTexture } from "three";

const SampledTile3D = (
  props: JSX.IntrinsicElements["mesh"] & {
    positions: Float32Array;
    texture: DataTexture | undefined;
    segments: number;
  }
) => {
  const { positions, texture, segments, ...meshProps } = props;
  //
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} {...meshProps}>
      {positions.length ? (
        <planeBufferGeometry
          attach="geometry"
          args={[0.98, 0.98, segments, segments]}
        >
          <bufferAttribute
            attach="attributes-position"
            itemSize={3}
            array={positions}
            count={positions.length / 3}
          />
        </planeBufferGeometry>
      ) : (
        <planeGeometry attach="geometry" args={[0.99, 0.99, 1, 1]} />
      )}
      {texture ? (
        <meshStandardMaterial map={texture} />
      ) : (
        <meshStandardMaterial color={0x5056b9} />
      )}
    </mesh>
  );
};

export default SampledTile3D;
