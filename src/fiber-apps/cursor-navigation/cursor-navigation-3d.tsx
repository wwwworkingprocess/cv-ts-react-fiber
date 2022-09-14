import { isMobile } from "react-device-detect";

import { Canvas } from "@react-three/fiber";
import { Billboard, OrbitControls, Text } from "@react-three/drei";

import useKeyboardNavigation from "./hooks/useKeyboardNavigation";

import Floor from "./fibers/floor";
import Player from "./fibers/player";
import FrameCounter from "./fibers/frame-counter";
import DefaultLightRig from "../DefaultLightRig";

import { ControlsContainer } from "./cursor-navigation-3d.styles";
import AxisValueInput from "./components/axis-value-input";

import useCursorAppStore from "./stores/useCursorAppStore";
import useAppController from "./hooks/useAppController";

const CursorNavigationDemo3D = (props: {
  isCameraEnabled: boolean;
  isFrameCounterEnabled: boolean;
  path?: string;
}) => {
  const { isCameraEnabled, isFrameCounterEnabled } = props;
  //
  useKeyboardNavigation();
  //
  const bounds = useCursorAppStore((state) => state.bounds);
  const [MIN_X, MAX_X, MIN_Y, MAX_Y] = bounds;
  //
  const { x, y, z, areaScale, onJump } = useAppController();
  //
  return (
    <>
      <Canvas shadows dpr={[1, 2]}>
        <DefaultLightRig castShadow={true} />
        {isCameraEnabled && (
          <OrbitControls
            minPolarAngle={0}
            maxPolarAngle={(Math.PI / 7) * 2}
            maxDistance={10}
          />
        )}
        <FrameCounter enabled={isFrameCounterEnabled} />

        {!isMobile && (
          <Billboard position={[0, 2.25, 0]} follow={true}>
            <Text fontSize={0.3} color={"#ffaa22"}>
              Use arrow keys for navigation and space for jump
            </Text>
          </Billboard>
        )}

        <Player x={x} y={y} z={z} position={[0, -0.5 + 0.05, 0]} />

        <Floor areaScale={areaScale} />
      </Canvas>
      <ControlsContainer>
        <AxisValueInput axis={"x"} min={MIN_X} max={MAX_X} />
        <AxisValueInput axis={"y"} min={0} max={10} />
        <AxisValueInput axis={"z"} min={MIN_Y} max={MAX_Y} />
        {isMobile ? <button onClick={onJump}>Jump</button> : undefined}
      </ControlsContainer>
    </>
  );
};

export default CursorNavigationDemo3D;
