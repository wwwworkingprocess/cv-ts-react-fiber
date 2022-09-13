import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import SeaSurfaceMaterial from "./sea-surface.shader";

const SeaLevel = (
  props: JSX.IntrinsicElements["mesh"] & {
    width: number;
    segments: number;
  }
) => {
  const { width, segments } = props;
  //
  const TRESHOLD_Y = 0.2;
  const isInProximity = useRef<boolean>();
  //

  useFrame(({ camera }) => {
    isInProximity.current = camera.position.y <= TRESHOLD_Y;
  });
  //
  return (
    <mesh>
      <planeBufferGeometry args={[width, width, segments, segments]} />
      {isInProximity.current ? (
        <SeaSurfaceMaterial />
      ) : (
        <meshStandardMaterial color={"blue"} />
      )}
    </mesh>
  );
};

export default SeaLevel;
