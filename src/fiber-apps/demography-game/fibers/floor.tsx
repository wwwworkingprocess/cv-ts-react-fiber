import { Vector3 } from "three";
import { Plane } from "@react-three/drei";

import DynamicBox from "./dynamic-box";

const Floor = (
  props: JSX.IntrinsicElements["group"] & { areaScale: Vector3 }
) => {
  const { areaScale, ...groupProps } = props;
  //
  return (
    <group {...groupProps}>
      <Plane
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1, 0]}
        args={[1000, 1000]}
      >
        <meshStandardMaterial attach="material" color="silver" />
      </Plane>

      <DynamicBox areaScale={areaScale} position={[0, -1 - 0.02, 0]} />
    </group>
  );
};

export default Floor;
