import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { isMobile } from "react-device-detect";

import { Canvas } from "@react-three/fiber";
import { Billboard, Bounds, OrbitControls, Text } from "@react-three/drei";

import Floor from "./fibers/floor";
import Player from "./fibers/player";
import FrameCounter from "./fibers/frame-counter";
import DefaultLightRig from "../DefaultLightRig";
// import Boxes from "../app-3d/fibers/boxes"; // use for debugging

import { ControlsContainer } from "./hgt-set-viewer-3d.styles";
import AxisValueInput from "./components/axis-value-input";

import useHgtSetViewerStore from "./stores/useHgtSetViewerStore";
import useAppController from "./hooks/useAppController";
import useKeyboardNavigation from "./hooks/useKeyboardNavigation";

import { Origin, useXyMemo } from "../../routes/viewer/viewer.component"; //TODO: move
import SampledTileGrid from "./fibers/sampled-tile-grid";
import { Color } from "three";
import Boxes from "../app-3d/fibers/boxes";
import { Spinner } from "../../components/spinner/spinner.component";

type HgtSetViewer3DProps = {
  selectedOrigin: Origin;
  heights:
    | {
        [k: string]: ArrayBuffer;
      }
    | undefined;
  isCameraEnabled: boolean;
  isFrameCounterEnabled: boolean;
  path?: string;
};

const HgtSetViewer3D = (props: HgtSetViewer3DProps) => {
  const { isCameraEnabled, isFrameCounterEnabled, heights, selectedOrigin } =
    props;
  //

  const [isFloorEnabled, setIsFloorEnabled] = useState<boolean>(false);
  const [is3dGridEnabled, setIs3dGridEnabled] = useState<boolean>(false);
  //
  const xyMemo = useXyMemo(heights);
  const values = useMemo(
    () => (heights ? Object.values(heights) : []),
    [heights]
  );
  useKeyboardNavigation();
  //
  const bounds = useHgtSetViewerStore((state) => state.bounds);
  const [MIN_X, MAX_X, MIN_Y, MAX_Y] = bounds;
  //
  const { x, y, z, areaScale, onJump } = useAppController(xyMemo);

  //
  // sampling points within a 300x300 area
  //
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  //
  const [takePixel, setTakePixel] = useState<number>(6);
  const [heightScale, setHeightScale] = useState<number>(1.0);
  const [heightShift, setHeightShift] = useState<number>(0.0 + 0.0025);
  //
  const dimensionMemo = useMemo(
    //TODO: fix this, 300 is 1200 / sampling, result needs to be an integer
    () =>
      Array.from(new Array(300 / takePixel).keys()).map((v) => v * takePixel),
    [takePixel]
  );

  //
  //TODO: fix scroll behavior, when the origin is selected for the first time
  //
  useEffect(() => {
    if (selectedOrigin) {
      const timeout = setTimeout(() => {
        canvasRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        } as ScrollIntoViewOptions);
      }, 0);
      //
      return () => clearTimeout(timeout);
    }
  }, [selectedOrigin]);
  //
  return (
    <>
      <div style={{ position: "relative" }}>
        Sample:
        {[2, 3, 5, 6, 10, 15, 30].map((takeEveryNthPixel, idx) => (
          <button
            key={idx}
            onClick={(e) => setTakePixel(takeEveryNthPixel)}
            style={{
              backgroundColor: takePixel === takeEveryNthPixel ? "#aaaaff" : "",
            }}
          >
            {takeEveryNthPixel}
          </button>
        ))}
        Height:
        <input
          type="number"
          step={0.05}
          value={heightScale}
          onChange={(e) => setHeightScale(parseFloat(e.target.value))}
          style={{ width: "60px" }}
        />
        Shift:
        <input
          type="number"
          step={0.025}
          value={heightShift}
          onChange={(e) => setHeightShift(parseFloat(e.target.value))}
          style={{ width: "70px" }}
        />
        Helpers:
        <input
          type="checkbox"
          checked={is3dGridEnabled}
          onChange={(e) => setIs3dGridEnabled((b) => !b)}
        />
        <input
          type="checkbox"
          checked={isFloorEnabled}
          onChange={(e) => setIsFloorEnabled((b) => !b)}
        />
        <div style={{ float: "right", width: "160px" }}>
          <button
            onClick={() => {
              canvasRef.current.scrollIntoView({
                behavior: "smooth",
                block: "end",
              } as ScrollIntoViewOptions);
            }}
          >
            Scroll Here
          </button>
          <button
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              } as ScrollToOptions);
            }}
          >
            Scroll Top
          </button>
        </div>
      </div>
      <Suspense fallback={<Spinner />}>
        <Canvas ref={canvasRef} shadows dpr={[1, 2]}>
          <DefaultLightRig castShadow={true} />
          <ambientLight intensity={0.3} />
          {isCameraEnabled && (
            <OrbitControls
              makeDefault // needed to tell Bounds that the camera controlls are limited (e.g. angle / distance)
              minPolarAngle={0}
              maxPolarAngle={(Math.PI / 7) * 2}
              maxDistance={10}
            />
          )}
          <FrameCounter enabled={isFrameCounterEnabled} />

          {!isMobile && (
            <Billboard position={[0, 2.25, 0]} follow={true}>
              <Text fontSize={0.23} color={"#ffaa22"}>
                Use arrow keys for navigation and space for jump
                {/* {selectedOrigin.locator}, idx: {selectedOrigin.zipIndex} [
                {selectedOrigin.lat.toFixed(3)},{selectedOrigin.lon.toFixed(3)}]
                {JSON.stringify({ x, y, z })}
                {JSON.stringify(bounds)} */}
              </Text>
            </Billboard>
          )}

          {/* 
          The white box, representing the player.
          When the position changes, the camera follows the player
        */}
          <Bounds fit clip observe damping={0.6} margin={5.19}>
            <Player x={x} y={y} z={z} position={[0, -0.5 + 0.05, 0]} />
          </Bounds>

          {/* Helper plane showing bounds */}
          {isFloorEnabled && (
            <Floor
              areaScale={areaScale}
              position={[-0.5 + areaScale.x / 2, 0, -0.5 + areaScale.y / 2]}
            />
          )}

          {/* Helper grid showing tile corners */}

          {is3dGridEnabled && (
            <Boxes
              i={areaScale.x + 1}
              j={areaScale.y + 1}
              baseColor={new Color("red")}
              position={[-1 + areaScale.x / 2, -0.85, -1 + areaScale.y / 2]}
            />
          )}

          {/* Grid of 1x1 planes, orienting upwards */}
          <SampledTileGrid
            values={values}
            xyMemo={xyMemo}
            dimensionMemo={dimensionMemo}
            areaScaleX={areaScale.x}
            areaScaleY={areaScale.y}
            heightScale={heightScale}
            heightShift={heightShift}
          />
        </Canvas>
      </Suspense>
      <ControlsContainer>
        <AxisValueInput axis={"x"} min={MIN_X} max={MAX_X} />
        <AxisValueInput axis={"y"} min={0} max={10} />
        <AxisValueInput axis={"z"} min={MIN_Y} max={MAX_Y} />
        {isMobile ? <button onClick={onJump}>Jump</button> : undefined}
      </ControlsContainer>
    </>
  );
};

export default HgtSetViewer3D;
