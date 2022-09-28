import { useState, useMemo, memo, useRef } from "react";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Physics } from "@react-three/cannon";

import { Heightfield } from "../../three-components/height-field/height-field.component";
import GridFloor from "./fibers/grid/grid-floor";

import useHeightBasedTexture from "./hooks/useHeightBasedTexture";
import TileMesh from "./fibers/tile-mesh";
import {
  DataTexture,
  LinearFilter,
  RGBAFormat,
  SpotLight,
  sRGBEncoding,
  UnsignedByteType,
} from "three";

import useSrtmTile from "../../hooks/srtm/useSrtmTile"; // zip - with single entry
import useSrtmTiles, { SAMPLING_MODE } from "../../hooks/srtm/useSrtmTiles";
//import useSrtmTiles from "../../hooks/srtm/useSrtmTiles"; // zip - with multiple hgts

export type GenerateHeightmapArgs = {
  height: number;
  number: number;
  scale: number;
  width: number;
};

//
// settings
//
const heightMapScale: number = 1;
const hgtOptions = [
  ["A", "N00E006"],
  ["B", "N42E011"],
  ["C", "N42E019"],
] as Array<[string, string]>;

//
const GridFloors: React.FC<{
  side: number;
  setHeightViewPort: React.Dispatch<
    React.SetStateAction<[number, number, number, number] | undefined>
  >;
  sampling: SAMPLING_MODE;
}> = memo((props) => (
  <>
    {[1].map((n) => (
      <GridFloor
        key={n}
        position={[0, 1 - n - 0.03, 0]}
        i={props.side}
        j={props.side}
        idx={n}
        //
        sampling={props.sampling}
        setHeightViewPort={props.setHeightViewPort}
      />
    ))}
  </>
));

const MovingSpotLight = () => {
  const ref = useRef<SpotLight>(null!);
  //
  useFrame(({ clock }) => {
    const tick = clock.elapsedTime * 0.3;
    //
    if (ref.current) ref.current.position.x = Math.sin(tick) * 7;
    if (ref.current) ref.current.position.z = Math.cos(tick) * 7;
    if (ref.current) ref.current.position.y = 0.5 + Math.cos(tick) * 0.25;
    //
    ref.current.intensity = 10 + Math.sin(tick) * 10;
  });
  //
  return (
    <spotLight
      ref={ref}
      color={0xfff1b0}
      position={[6, 0.1, 6]}
      intensity={30}
      power={2}
      angle={0.75}
      penumbra={0.72}
      castShadow
      shadowCameraNear={0.1}
      shadowCameraFar={100}
      shadow-mapSize-height={1024}
      shadow-mapSize-width={1024}
    />
  );
};

const HeightMapRandomApp3D = (props: {
  isFullscreenEnabled: boolean;
  isFullscreenAvailable: boolean;
  toggleFullscreen: () => Promise<void>;
}) => {
  const { isFullscreenEnabled, isFullscreenAvailable, toggleFullscreen } =
    props;
  //
  const [rotating, setRotating] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showWireframe, setShowWireframe] = useState<boolean>(false);

  const gridDivisions = 10;
  const [sampling, setSampling] = useState<SAMPLING_MODE>(
    // 1200
    // 600
    300
    // 150
    // SAMPLING_MODE.SAMPLE_TO_600X600
  );
  const heightViewportSize = useMemo(
    () => Math.floor(sampling / gridDivisions),
    [sampling]
  );

  const [scalePositionY, setScalePositionY] = useState<number>(0.00043);
  const [heightViewPort, setHeightViewPort] = useState<
    [number, number, number, number] | undefined
  >([0, 0, heightViewportSize, heightViewportSize]);
  //
  // const [sampling, setSampling] = useState<SAMPLING_MODE>(1200);
  // const [hgtLocator, setHgtLocator] = useState<string>("N00E006");

  // test multi-zip  ---   N * (1200*1200) = N * 1.44m int16s

  const [hgtLocator, setHgtLocator] = useState<string>("J26"); // J26 / SM42
  // const [hgtLocator, setHgtLocator] = useState<string>("SM42"); // J26 / SM42
  const { values: heights } = useSrtmTiles(hgtLocator, sampling);

  const [hgtSelectedIndex, setHgtSelectedIndex] = useState<number>(0); // heights ? Object.values(heights)[0] : undefined; // first entry
  const heights1200 = heights
    ? Object.values(heights)[hgtSelectedIndex]
    : undefined; // first entry

  //
  //
  //
  const dataTexture = useHeightBasedTexture(heights1200, sampling);
  //
  const dataTextureHeightfield = useMemo(() => {
    if (dataTexture && heightViewPort) {
      const [min_x, min_y, max_x, max_y] = heightViewPort; //  viewport
      //
      const imageData = dataTexture?.source.data.data as Uint8Array; // 4*1200*1200 items
      //
      if (imageData) {
        const heightsRows = [];
        //
        for (let row_idx = min_x; row_idx < max_x; row_idx++) {
          const currentRow = [];
          //
          for (let col_idx = min_y; col_idx < max_y; col_idx++) {
            //
            // core operation: keep when within viewport [0,0,120,120]
            // intervals are [0,120)   (first item inclusive, 120 exclusive)
            //
            const inBoundsHorizontal = min_x <= row_idx && row_idx < max_x;
            const inBoundsVertical = min_y <= col_idx && col_idx < max_y;
            //
            const inBounds = inBoundsHorizontal && inBoundsVertical;
            //
            if (inBounds) {
              const BYTES_PER_PIXEL = 4;
              const offset = (row_idx * sampling + col_idx) * BYTES_PER_PIXEL;
              //
              currentRow.push(
                imageData[offset] ?? 0,
                imageData[offset + 1] ?? 0,
                imageData[offset + 2] ?? 0,
                imageData[offset + 3] ?? 0
              );
            }
          }
          //
          if (currentRow.length) heightsRows.push(...currentRow);
        }
        //
        // console.log("heightsRows", heightsRows);
        //
        if (heightsRows) {
          const uint8arr = Uint8Array.from(heightsRows);
          //
          const texture = new DataTexture(
            uint8arr,
            heightViewportSize,
            heightViewportSize,
            RGBAFormat,
            UnsignedByteType
          );
          //
          texture.flipY = true; // flipping image on vertical axis
          //
          texture.minFilter = LinearFilter;
          texture.magFilter = LinearFilter;
          texture.encoding = sRGBEncoding;
          //
          texture.needsUpdate = true;
          //
          return texture;
        }
      }
    }
    //
    return null;
  }, [dataTexture, heightViewPort, sampling, heightViewportSize]);

  //
  // BufferAttribute, height information for TileMesh (1200*1200)
  //
  const positions = useMemo(() => {
    if (heights1200) {
      const SCALE_Z = 1; // TODO: unit_per_y x2 as (lat,lng) needs 2x1 rectanle
      //
      const count = sampling; // number of vertices across one axis
      //
      const width = 10; // scale in x dimension
      const height = 10; // scale in z dimension
      //
      const unit_per_x = 1 / (count / width); // 1 / 120
      const unit_per_z = SCALE_Z / (count / height); // 1 / 120
      //
      //
      let arr = [] as Array<number>;
      for (let xi = 0; xi < count; xi++) {
        for (let zi = 0; zi < count; zi++) {
          let x = (xi - count / 2) * unit_per_x; // - 5;
          let z = (zi - count / 2) * unit_per_z; // - 5;
          let y = heights1200[xi * sampling + zi];
          //
          arr.push(x, z, y); // positions.push(x, y, z);
        }
      }
      //
      return new Float32Array(arr);
    }
    //
    return new Float32Array(0); // empty array
  }, [heights1200, sampling]);

  //
  // height information for the heightfield component (120*120)
  //
  const heightMemo = useMemo(() => {
    if (heights1200 && heightViewPort) {
      //
      // return first 120x120 result is Array<Array<number>>
      //
      const [min_x, min_y, max_x, max_y] = heightViewPort; //  viewport
      //
      const heightsRows = [];
      for (let row_idx = min_x; row_idx < max_x; row_idx++) {
        const currentRow = [];
        //
        for (let col_idx = min_y; col_idx < max_y; col_idx++) {
          //
          // core operation: keep when within viewport [0,0,120,120]
          // intervals are [0,120)   (first item inclusive, 120 exclusive)
          //
          const inBoundsHorizontal = min_x <= row_idx && row_idx < max_x;
          const inBoundsVertical = min_y <= col_idx && col_idx < max_y;
          //
          const inBounds = inBoundsHorizontal && inBoundsVertical;
          //
          if (inBounds) {
            const offset = row_idx * sampling + col_idx;
            //
            currentRow.push(heights1200[offset] || -1); // ignore errors
          }
        }
        //
        if (currentRow.length) heightsRows.push(currentRow);
      }
      //
      return heightsRows;
    }
    //
    return [] as Array<Array<number>>;
  }, [heights1200, heightViewPort, sampling]);

  //
  //
  //

  //
  const imageMemo = useMemo(() => {
    if (!dataTexture) return null;
    if (!dataTexture.image.data) return null;
    //
    const imagedata_to_image = (imagedata: ImageData) => {
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      canvas.width = imagedata.width;
      canvas.height = imagedata.height;
      //
      if (ctx) ctx.putImageData(imagedata, 0, 0);
      //
      return (
        <img
          alt=""
          src={canvas.toDataURL()}
          style={{ width: `${sampling}px`, height: `${sampling}px`, zoom: 0.5 }}
        />
      );
    };
    //
    const ids = {
      dataArray: dataTexture.image.data,
    } as ImageDataSettings;
    const id = new ImageData(sampling, sampling, ids);
    //
    const d = dataTexture.image.data;
    for (let i = 0; i < id.data.length; i += 4) {
      // Modify pixel data
      id.data[i + 0] = d[i + 0]; // R value
      id.data[i + 1] = d[i + 1]; // G value
      id.data[i + 2] = d[i + 2]; // B value
      id.data[i + 3] = d[i + 3]; // A value
    }
    //
    return imagedata_to_image(id);
  }, [dataTexture, sampling]);
  //
  return (
    <>
      <div style={{ height: "300px" }}>
        {heights &&
          Object.entries(heights).map(([hgtName, heights1200], idx) => (
            <div key={idx} onClick={() => setHgtSelectedIndex(idx)}>
              [{idx}]<span>{hgtName}</span> {heights1200.length}
            </div>
          ))}
      </div>
      {imageMemo}
      {sampling} | {heightViewportSize} | {heightViewPort?.join("-")} |{" "}
      {dataTextureHeightfield?.source.data.data.byteLength} | HM:
      {heightMemo.length}
      <Canvas
        camera={{
          position: [5, 10, 5],
          near: 0.1,
          far: 100,
        }}
      >
        {showGrid && (
          <>
            <gridHelper position={[0, 0, 0]} />
            <GridFloors
              side={10}
              setHeightViewPort={setHeightViewPort}
              sampling={sampling}
            />
          </>
        )}

        <ambientLight intensity={0.35} />
        <MovingSpotLight />

        <OrbitControls
          enableZoom={true}
          autoRotate={rotating}
          autoRotateSpeed={0.3}
        />

        {heightMemo && dataTextureHeightfield && (
          <Physics>
            <group
              position={[0 - heightMapScale / 2, 0 + 2, heightMapScale / 2]}
              scale={[3, 0.00075, 3]}
            >
              <Heightfield
                elementSize={(heightMapScale * 1) / 128}
                heights={heightMemo}
                position={[0, 0, 0]}
                rotation={[0, 0, 0]}
                dataTextureHeightfield={dataTextureHeightfield}
                showWireframe={showWireframe}
              />
            </group>
          </Physics>
        )}

        <group position={[0, 3, -3]} rotation={[0, Math.PI / 2, 0]}>
          <mesh rotation={[0, -Math.PI / 2, Math.PI / 2]} position={[3, 0, 0]}>
            <planeBufferGeometry args={[4, 4, 1, 1]} />
            {dataTexture && (
              <meshStandardMaterial wireframe={false} map={dataTexture} />
            )}
          </mesh>
          <mesh rotation={[0, -Math.PI / 2, Math.PI / 2]}>
            <planeBufferGeometry
              args={[3, 3, heightViewportSize - 1, heightViewportSize - 1]}
            />
            {dataTextureHeightfield && (
              <meshStandardMaterial
                wireframe={false}
                colorWrite={true}
                map={dataTextureHeightfield}
              />
            )}
          </mesh>
        </group>

        {positions && dataTexture && (
          <TileMesh
            wSegments={sampling - 1}
            hSegments={sampling - 1}
            scalePositionY={scalePositionY}
            positions={positions}
            dataTexture={dataTexture}
          />
        )}
      </Canvas>
      <hr />
      <div style={{ position: "relative", top: "-20px", userSelect: "none" }}>
        {isFullscreenAvailable && (
          <button onClick={toggleFullscreen} style={{ float: "right" }}>
            {isFullscreenEnabled ? "Disable fullscreen" : "Enable fullscreen"}
          </button>
        )}
        HGT:
        {hgtOptions.map(([label, locator], idx) => (
          <button key={idx} onClick={(e) => setHgtLocator(locator)}>
            {label}
          </button>
        ))}
        Scale:{" "}
        <input
          type="number"
          value={scalePositionY}
          step={0.0001}
          style={{ width: "75px" }}
          onChange={(e) => setScalePositionY(parseFloat(e.target.value))}
        />
        Auto rotate:
        <input
          type="checkbox"
          checked={rotating}
          onChange={(e) => setRotating(!rotating)}
        />
        Grid:
        <input
          type="checkbox"
          checked={showGrid}
          onChange={(e) => setShowGrid(!showGrid)}
        />
        Wirefr.:
        <input
          type="checkbox"
          checked={showWireframe}
          onChange={(e) => setShowWireframe(!showWireframe)}
        />
      </div>
    </>
  );
};

export default HeightMapRandomApp3D;
