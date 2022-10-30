import { OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { MOUSE, Vector3 } from "three";

const baseControlsProps = {
  makeDefault: true,
  panSpeed: 0.061,
  enableDamping: false,
  enableRotate: false,
  minPolarAngle: 0,
  maxPolarAngle: (Math.PI / 7) * 2,
  maxZoom: 100,
  maxDistance: 100,
  mouseButtons: {
    LEFT: MOUSE.PAN,
    MIDDLE: MOUSE.ROTATE,
    RIGHT: MOUSE.DOLLY,
  },
};

type CameraControlsProps = {
  selectedCode: string | undefined;
  position: Vector3;
};

const CameraControls = (props: CameraControlsProps) => {
  const { position, selectedCode } = props;
  //
  const orbitControlsProps = useMemo(
    () => ({
      ...baseControlsProps,
      enablePan: selectedCode !== undefined,
      enableZoom: selectedCode !== undefined,
    }),
    [selectedCode]
  );
  //
  return <OrbitControls position={position} {...orbitControlsProps} />;
};

export default CameraControls;
