import { useFrame } from "@react-three/fiber";
import { Mesh, Vector3 } from "three";

import useGameAppStore from "../stores/useGameAppStore";

import FrameCounter from "./frame-counter";

type CrossHairOwnProps = {
  mutableRef: React.MutableRefObject<Mesh<any, any>>;
  focus: Vector3;
};

const CrossHair = (
  props: JSX.IntrinsicElements["mesh"] & CrossHairOwnProps
) => {
  const { mutableRef, position, focus, ...meshProps } = props;
  //
  const paused = false; //TODO: from store
  const setMoving = useGameAppStore((s) => s.setMoving); //TODO: via controller
  //
  const [zoom, moving, selectedCode] = useGameAppStore((s) => [
    s.zoom,
    s.moving,
    s.selectedCode,
  ]);

  //
  // Detecting if the crosshair has reached the 'focus' point
  //
  useFrame((state) => {
    if (zoom) {
      const p1 = mutableRef.current.position.clone();
      const p2 = focus.clone();
      //
      const crosshairDistanceFromDestination = p2.sub(p1).length();
      const epsilon = 0.02;
      //
      const hasArrived = crosshairDistanceFromDestination < epsilon;
      //
      if (moving && hasArrived && selectedCode) {
        console.log("Arrived.", selectedCode);
        setMoving(false, selectedCode);
      }
    }
  });

  //
  //
  //
  return (
    <mesh
      ref={mutableRef}
      position={position}
      rotation={[Math.PI / 2, 0, 0]}
      {...meshProps}
    >
      <torusBufferGeometry attach="geometry" args={[0.05, 0.0025, 8, 24]} />
      <meshStandardMaterial color="gold" />

      {/* <group scale={[-1, 1, 1]} position={[0, 0, -0.3]}>
        <FrameCounter enabled={!paused} />
      </group> */}
    </mesh>
  );
};

export default CrossHair;
