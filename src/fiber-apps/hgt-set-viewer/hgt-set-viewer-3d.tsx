import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { isMobile } from "react-device-detect";

import { Canvas } from "@react-three/fiber";
import { Billboard, Bounds, OrbitControls, Text } from "@react-three/drei";
import { Color } from "three";

import { Spinner } from "../../components/spinner/spinner.component";
import ViewerSettings from "./components/viewer-settings/viewer-settings";
import AxisValueInput from "./components/axis-value-input/axis-value-input";

import Floor from "./fibers/floor";
import Player from "./fibers/player";
import FrameCounter from "./fibers/frame-counter";
import DefaultLightRig from "../DefaultLightRig";
import SampledTileGrid from "./fibers/sampled-tile-grid";
import Boxes from "../app-3d/fibers/boxes";

import useHgtSetViewerStore from "./stores/useHgtSetViewerStore";
import useAppController from "./hooks/useAppController";
import useKeyboardNavigation from "./hooks/useKeyboardNavigation";

import { Origin, useXyMemo } from "../../routes/viewer/viewer.component"; //TODO: move

import {
  ControlsContainer,
  SettingsContainer,
} from "./hgt-set-viewer-3d.styles";

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

const optTop = { top: 0, behavior: "smooth" } as ScrollToOptions;
const optCanvas = { behavior: "smooth", block: "end" } as ScrollIntoViewOptions;

const HgtSetViewer3D = (props: HgtSetViewer3DProps) => {
  const { isCameraEnabled, isFrameCounterEnabled, heights, selectedOrigin } =
    props;
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
  const [isFloorEnabled, setIsFloorEnabled] = useState<boolean>(false);
  const [is3dGridEnabled, setIs3dGridEnabled] = useState<boolean>(false);
  const [takePixel, setTakePixel] = useState<number>(6);
  const [heightScale, setHeightScale] = useState<number>(1.0);
  const [heightShift, setHeightShift] = useState<number>(0.0 + 0.0025);
  //
  const scrollToTop = () => window.scrollTo(optTop);
  const scrollToCanvas = useCallback(
    () => canvasRef.current.scrollIntoView(optCanvas),
    []
  );
  //
  const viewerSettingsProps = {
    isFloorEnabled,
    is3dGridEnabled,
    takePixel,
    heightScale,
    heightShift,
    setIsFloorEnabled,
    setIs3dGridEnabled,
    setTakePixel,
    setHeightScale,
    setHeightShift,
    scrollToTop,
    scrollToCanvas,
  };
  //
  const sampling = 4;
  const dimensionMemo = useMemo(
    () =>
      Array.from(new Array(Math.floor(1200 / sampling) / takePixel).keys()).map(
        (v) => v * takePixel
      ),
    [takePixel, sampling]
  );

  const sampledTileGridProps = {
    values,
    xyMemo,
    dimensionMemo,
    areaScaleX: areaScale.x,
    areaScaleY: areaScale.y,
    heightScale,
    heightShift,
  };

  //
  // Scroll the canvas into view when selected origin changes
  //
  useEffect(() => {
    if (selectedOrigin) {
      const timeout = setTimeout(scrollToCanvas, 100);
      //
      return () => clearTimeout(timeout);
    }
  }, [selectedOrigin, scrollToCanvas]);
  //
  return (
    <>
      {/* Used to control display and elevation rendering properties */}
      <SettingsContainer>
        <ViewerSettings {...viewerSettingsProps}></ViewerSettings>
      </SettingsContainer>

      {/* The canvas only attached to the DOM, after all components are loaded */}
      <Suspense fallback={<Spinner />}>
        <Canvas ref={canvasRef} shadows dpr={[1, 2]}>
          <DefaultLightRig castShadow={true} />
          <ambientLight intensity={0.3} />
          {isCameraEnabled && (
            <OrbitControls
              makeDefault // needed to tell Bounds that the camera controlls are limited (e.g. angle / distance)
              minPolarAngle={0}
              maxPolarAngle={0 + (7 * Math.PI) / 15}
              maxDistance={10}
            />
          )}
          <FrameCounter enabled={isFrameCounterEnabled} />

          {!isMobile && (
            <Billboard position={[0, 2.25, 0]} follow={true}>
              <Text fontSize={0.23} color={"#ffaa22"}>
                Use arrow keys for navigation and space for jump
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
          <SampledTileGrid {...sampledTileGridProps} />
        </Canvas>
      </Suspense>
      <ControlsContainer>
        <AxisValueInput axis={"x"} min={MIN_X} max={MAX_X} />
        <AxisValueInput axis={"y"} min={0} max={10} />
        <AxisValueInput axis={"z"} min={MIN_Y} max={MAX_Y} />
        {isMobile ? (
          <div style={{ width: "20%" }}>
            <button
              style={{
                width: "70px",
                height: "40px",
                position: "relative",
                top: "-30px",
                backgroundColor: "rgba(255,255,255,0.55)",
              }}
              onClick={onJump}
            >
              Jump
            </button>
          </div>
        ) : undefined}
      </ControlsContainer>
    </>
  );
};

export default HgtSetViewer3D;
