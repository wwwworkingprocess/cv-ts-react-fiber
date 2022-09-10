import { useMemo } from "react";

import { DoubleSide, Vector3 } from "three";
import { Billboard, Text } from "@react-three/drei";

const GridCrossHair = (
  props: JSX.IntrinsicElements["mesh"] & {
    crossHairPosition: Vector3 | undefined;
    crossHairHeight: number;
  }
) => {
  const { crossHairPosition, crossHairHeight } = props;
  //
  const billBoardText = useMemo(
    () =>
      crossHairPosition
        ? JSON.stringify([crossHairPosition.x, crossHairPosition.z])
        : undefined,
    [crossHairPosition]
  );
  //
  return crossHairPosition ? (
    <mesh position={crossHairPosition}>
      <boxGeometry attach={"geometry"} args={[0.95, crossHairHeight, 0.95]} />
      <meshPhongMaterial
        attach={"material"}
        color={"blue"}
        side={DoubleSide}
        opacity={0.15}
        transparent={true}
      />
      <Billboard>
        <Text
          fontSize={0.15}
          position={[0, crossHairHeight * 0.75, 0]}
          fillOpacity={1}
        >
          {billBoardText}
        </Text>
      </Billboard>
    </mesh>
  ) : null;
};

export default GridCrossHair;
