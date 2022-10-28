const CircularProgress = (
  props: JSX.IntrinsicElements["group"] & { progressOffset: number }
) => {
  const { progressOffset, ...groupProps } = props;
  //
  const arcProgressed = progressOffset * 2 * Math.PI;
  const arcRemains = (1 - progressOffset) * 2 * Math.PI;
  //
  return (
    <group
      visible={progressOffset < 1}
      rotation={[0, 0, Math.PI / 2]}
      {...groupProps}
    >
      <mesh position={[0.121, 0, 0]} scale={[1, -1, 1]}>
        <torusBufferGeometry
          attach="geometry"
          args={[0.0325, 0.008125, 8, 24, arcProgressed]}
        />
        <meshStandardMaterial color="#00ff00" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0.121, 0, 0]} scale={[1, 1, 1]}>
        <torusBufferGeometry
          attach="geometry"
          args={[0.0325, 0.008125, 8, 24, arcRemains]}
        />
        <meshStandardMaterial color="#224422" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

export default CircularProgress;
