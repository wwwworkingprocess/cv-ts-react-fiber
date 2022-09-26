import { isMobile } from "react-device-detect";

import { Canvas } from "@react-three/fiber";
import { Billboard, Bounds, OrbitControls, Text } from "@react-three/drei";

import useKeyboardNavigation from "./hooks/useKeyboardNavigation";

import Floor from "./fibers/floor";
import Player from "./fibers/player";
import FrameCounter from "./fibers/frame-counter";
import DefaultLightRig from "../DefaultLightRig";

import { ControlsContainer } from "./hgt-set-viewer-3d.styles";
import AxisValueInput from "./components/axis-value-input";

import useAppController from "./hooks/useAppController";
import useHgtSetViewerStore from "./stores/useHgtSetViewerStore";
import { Origin, useXyMemo } from "../../routes/viewer/viewer.component";
import { useMemo, useState } from "react";
import Boxes from "../app-3d/fibers/boxes";
import {
  DataTexture,
  LinearFilter,
  RGBAFormat,
  sRGBEncoding,
  UnsignedByteType,
} from "three";
import coloring from "../../utils/colors";
import { changeEndianness } from "../../utils/srtm";

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
  const xyMemo = useXyMemo(heights);
  const values = useMemo(
    () => (heights ? Object.values(heights) : []),
    [heights]
  );
  //
  console.log("HgtSetViewer3D starting with xyMemo", xyMemo);
  //
  useKeyboardNavigation();
  //
  const bounds = useHgtSetViewerStore((state) => state.bounds);
  const [MIN_X, MAX_X, MIN_Y, MAX_Y] = bounds;
  //
  const { x, y, z, areaScale, onJump } = useAppController(xyMemo);

  //
  const activeBounds = useMemo(
    () => (xyMemo ? xyMemo.b : [0, 0, 0, 0]),
    [xyMemo]
  );

  //
  // sampling points within a 300x300 area
  //
  const [takePixel, setTakePixel] = useState<number>(10);
  //
  const dimensionMemo = useMemo(
    () =>
      Array.from(new Array(300 / takePixel).keys()).map((v) => v * takePixel),
    [takePixel]
  );

  //
  // only rerendering grid, when bounds is changing
  //
  const renderedGridMemo = useMemo(() => {
    console.log("RERENDERING");
    const G = dimensionMemo;
    //
    const newArray = (size: number) => [...new Array(size).keys()];
    //
    return newArray(areaScale.x).map((n) =>
      newArray(areaScale.y).map((m) => {
        const scale = 4; // [1200x1200] ->  [300x300]
        //
        const blockX = Math.floor(n / scale); // rows
        const blockY = Math.floor(m / scale); // cols
        //
        const zi = xyMemo.grid?.[blockY]?.[blockX]?.zi;

        let texture;
        let positions;
        //
        //
        if (zi !== -1) {
          //
          // the sub region is 300*300
          //
          const sub_x = (n % scale) * (1200 / scale);
          const sub_y = (m % scale) * (1200 / scale);
          const target_offset = sub_y * 1201 * 2 + sub_x * 2;
          //
          const offsets = G.map((r, ri) =>
            G.map((c, ci) => {
              const o: number = target_offset + (300 - r) * 1201 * 2 + c * 2;

              return Math.floor(o);
            })
          ).flat();

          //
          //  Taking out values from the original buffer (where one value is 2x1 bytes)
          //
          const takeByOffset = (off: number) =>
            changeEndianness(new Int16Array(values[zi].slice(off, off + 2)))[0];
          //
          const hs = offsets.map(takeByOffset); // height information ( 1 value per sample)
          const cols = hs.map(coloring.get_color_by_height); // rgba   ( 4 value per sample)
          //
          // creating a downsampled datatexture for the tile, based on the height data
          //
          const uint8arr = Uint8Array.from(
            cols.map((c) => [c.r, c.g, c.b, c.a]).flat()
          );
          texture = new DataTexture(
            uint8arr,
            G.length,
            G.length,
            RGBAFormat,
            UnsignedByteType
          );
          texture.minFilter = LinearFilter;
          texture.magFilter = LinearFilter;
          texture.encoding = sRGBEncoding;
          //
          texture.needsUpdate = true;
          //
          // filling position data for vertices, based on the height data
          //
          let arr = [] as Array<number>;
          const l = G.length;
          let maxLength = l * l - 1;
          //
          const unit_per_x = 1 / (l - 1 - 0.75);
          const unit_per_z = 1 / (l - 0.75);
          //
          for (let xi = 0; xi < l; xi++) {
            for (let zi = 0; zi < l; zi++) {
              let x = (xi - l / 2) * unit_per_x;
              let z = (zi - l / 2) * unit_per_z;
              //
              let HEIGHT = hs[maxLength - xi * l + zi] * 0.00041;
              //
              arr.push(z, -x, HEIGHT);
            }
          }
          //
          positions = new Float32Array(arr);
        } else {
          positions = new Float32Array(0);
          texture = undefined;
        }
        //
        //
        //
        return (
          <mesh
            key={`${n}_${m}`}
            position={[n * 1, 0.0031, m * 1]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            {positions.length ? (
              <planeBufferGeometry
                attach="geometry"
                args={[0.98, 0.98, G.length - 1, G.length - 1]}
              >
                <bufferAttribute
                  attach="attributes-position"
                  itemSize={3}
                  array={positions}
                  count={positions.length / 3}
                />
              </planeBufferGeometry>
            ) : (
              <planeGeometry attach="geometry" args={[0.99, 0.99, 1, 1]} />
            )}
            {texture ? (
              <meshStandardMaterial map={texture} />
            ) : (
              <meshStandardMaterial color={0x5056b9} />
            )}
          </mesh>
        );
      })
    );
  }, [dimensionMemo, activeBounds, areaScale.x, areaScale.y]);

  return (
    <>
      <Canvas shadows dpr={[1, 2]}>
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
            <Text fontSize={0.3} color={"#ffaa22"}>
              {/* Use arrow keys for navigation and space for jump */}
              {selectedOrigin.locator}, idx: {selectedOrigin.zipIndex} [
              {selectedOrigin.lat.toFixed(3)},{selectedOrigin.lon.toFixed(3)}]
              {JSON.stringify({ x, y, z })}
              {JSON.stringify(bounds)}
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
        <Floor
          areaScale={areaScale}
          position={[-0.5 + areaScale.x / 2, 0, -0.5 + areaScale.y / 2]}
        />

        {/* Helper grid showing tile corners */}

        {/* <Boxes
          i={areaScale.x + 1}
          j={areaScale.y + 1}
          baseColor={new Color("red")}
          position={[-1 + areaScale.x / 2, -0.85, -1 + areaScale.y / 2]}
        /> */}

        {/* Grid of 1x1 planes, orienting upwards */}
        {renderedGridMemo}
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

export default HgtSetViewer3D;
