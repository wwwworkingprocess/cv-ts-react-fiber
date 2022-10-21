import { useFrame } from "@react-three/fiber";
import { BufferGeometry, Material, Mesh, Vector3 } from "three";
import useGameAppStore from "../stores/useGameAppStore";
import FrameCounter from "./frame-counter";

const CrossHair = (props: {
  crosshairMesh: React.MutableRefObject<
    Mesh<BufferGeometry, Material | Material[]>
  >;
  focus: Vector3;
  crosshairStartPosition: Vector3;
}) => {
  const { crosshairMesh, crosshairStartPosition, focus } = props;
  //
  const paused = false; //TODO: from store
  //
  const zoom = useGameAppStore((state) => state.zoom);
  const moving = useGameAppStore((state) => state.moving);
  const selectedCode = useGameAppStore((state) => state.selectedCode);
  //
  const setMoving = useGameAppStore((state) => state.setMoving);
  //
  //
  //
  useFrame((state) => {
    if (zoom) {
      const p1 = crosshairMesh.current.position.clone();
      const p2 = focus.clone();
      //
      const crosshairDistanceFromDestination = p2.sub(p1).length();
      const epsilon = 0.02;
      //
      const hasArrived = crosshairDistanceFromDestination < epsilon;
      //
      if (!hasArrived) {
        //TODO: aggregate distance traveled here
        // console.log(crosshairDistanceFromDestination);
      } else {
        if (moving && selectedCode) {
          console.log("Arrived.", selectedCode);
          setMoving(false, selectedCode);
        }
      }
    }
  });
  //
  return (
    <mesh
      ref={crosshairMesh}
      position={crosshairStartPosition}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <torusBufferGeometry attach="geometry" args={[0.05, 0.0025, 8, 24]} />
      <meshStandardMaterial color="gold" />
      <group scale={[-1, 1, 1]} position={[0, 0, -0.3]}>
        <FrameCounter enabled={!paused} />
      </group>
    </mesh>
  );
};

export default CrossHair;
