import { useTexture } from "@react-three/drei";
import { useMemo } from "react";
import { Euler, Vector3 } from "three";

const WorldPlane = (props: { path?: string }) => {
  const { path } = props;
  //
  const groupToStageRotation = new Euler(-Math.PI / 2, 0, 0);
  const groupShiftBeforeRotation = new Vector3(-0.14, -0.4, -1 /*depth */);
  const groupScale = new Vector3(1.1, 1.1, 1);
  //
  const p = `${path ?? process.env.PUBLIC_URL}data/earth/`;
  const specular_map = `${p}3_no_ice_clouds_8k.jpg`;
  //
  const texture = useTexture(specular_map);

  //
  const memoizedMesh = useMemo(() => {
    const meshScale = new Vector3(-1.8, 1.8, 1.8);
    //
    return texture ? (
      <mesh position={[0, 0, 0]} scale={meshScale}>
        <planeBufferGeometry attach="geometry" args={[180, 90]} />
        <meshStandardMaterial
          attach="material"
          map={texture}
          map-flipY={false}
        />
      </mesh>
    ) : null;
  }, [texture]);
  //
  return (
    <group scale={[1, 1, 1]}>
      <group rotation={groupToStageRotation}>
        <group position={groupShiftBeforeRotation} scale={groupScale}>
          {memoizedMesh}
        </group>
      </group>
    </group>
  );
};

export default WorldPlane;
