import { RoundedBox } from "@react-three/drei";
import { Vector3 } from "three";

const DynamicBox = (props: {
  areaScale: Vector3;
  position?: Vector3 | [number, number, number];
}) => {
  const { areaScale, position } = props;
  //
  return areaScale ? (
    <RoundedBox
      position={position}
      scale={areaScale}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      castShadow
      {...props}
    >
      <meshStandardMaterial color={"#44aaff"} />
    </RoundedBox>
  ) : null;
};

export default DynamicBox;
