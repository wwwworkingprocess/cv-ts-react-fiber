import { useState, useMemo, memo } from "react";

import { Canvas } from "@react-three/fiber";
import { Bounds, BoundsProps, OrbitControls } from "@react-three/drei";
import { Physics } from "@react-three/cannon";

import { Color } from "three";

import { Heightfield } from "../../three-components/height-field/height-field.component";
import GridFloor from "./fibers/grid/grid-floor";

import useHgtSource from "./hooks/useHgtSource";
import useHeightBasedTexture from "./hooks/useHeightBasedTexture";
import TileMesh from "./fibers/tile-mesh";

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
const boundsProps: BoundsProps = {
  fit: true,
  clip: true,
  observe: true,
  damping: 6,
  margin: 0.9,
};
//
const hgtOptions = [
  ["A", "data/hgt/N42E011.hgt"],
  ["B", "data/hgt/N42E019.hgt"],
  // ["C", "data/hgt/N44E010.hgt"],
] as Array<[string, string]>;

//
const GridFloors: React.FC<{ n: number }> = memo((props) => (
  <>
    {[1].map((n) => (
      <GridFloor
        key={n}
        position={[0, 1 - n - 0.03, 0]}
        i={10}
        j={10}
        idx={n}
        baseColor={new Color(Math.random(), Math.random(), Math.random())}
      />
    ))}
  </>
));

const HeightMapRandomApp3D = () => {
  const [hgtUrl, setHgtUrl] = useState<string>("data/hgt/N42E011.hgt");
  const [rotating, setRotating] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [scalePositionY, setScalePositionY] = useState<number>(0.00043);
  //
  //
  const heights1200: Int16Array | undefined = useHgtSource(hgtUrl); // 1* (1200*1200) = 1.44m int16s
  //
  const dataTexture = useHeightBasedTexture(heights1200);

  //
  // BufferAttribute, height information for TileMesh (1200*1200)
  //
  const positions = useMemo(() => {
    if (heights1200) {
      const SCALE_Z = 1; // TODO: unit_per_y x2 as (lat,lng) needs 2x1 rectanle
      //
      const count = 1200; // number of vertices across one axis
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
          let y = heights1200[xi * 1200 + zi];
          //
          arr.push(x, z, y); // positions.push(x, y, z);
        }
      }
      //
      return new Float32Array(arr);
    }
    //
    return new Float32Array(0); // empty array
  }, [heights1200]);

  //
  // height information for the heightfield component (100*100)
  //
  const heightMemo = useMemo(() => {
    if (heights1200) {
      //
      // return first 100x100 result is Array<Array<number>>
      //
      const [min_x, min_y, max_x, max_y] = [0, 0, 100, 100]; // viewport
      //
      const heightsRows = [];
      for (let row_idx = min_x; row_idx < max_x; row_idx++) {
        const currentRow = [];
        //
        for (let col_idx = min_y; col_idx < max_y; col_idx++) {
          //
          // core operation: keep when within viewport [0,0,100,100]
          // intervals are [0,100)   (first item inclusive, 100 exclusive)
          //
          const inBoundsHorizontal = min_x <= row_idx && row_idx < max_x;
          const inBoundsVertical = min_y <= col_idx && col_idx < max_y;
          //
          const inBounds = inBoundsHorizontal && inBoundsVertical;
          //
          if (inBounds) {
            const offset = row_idx * 1200 + col_idx;
            //
            currentRow.push(heights1200[offset]);
          }
        }
        //
        if (currentRow.length) heightsRows.push(currentRow);
      }
      //
      //
      console.log("heightMemo", heightsRows);
      //
      return heightsRows;
    }
    //
    return [] as Array<Array<number>>;
  }, [heights1200]);
  //
  //
  return (
    <>
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
            <GridFloors n={1} />
          </>
        )}

        <ambientLight intensity={0.3} />
        <spotLight position={[10, 20, 10]} angle={0.15} penumbra={1} />
        <OrbitControls
          enableZoom={true}
          autoRotate={rotating}
          autoRotateSpeed={0.3}
        />

        <Physics>
          <group
            position={[-heightMapScale / 2, 0 + 0.5, heightMapScale / 2]}
            scale={[1, 0.00075, 1]}
          >
            {heightMemo && (
              <Heightfield
                elementSize={(heightMapScale * 1) / 128}
                heights={heightMemo}
                position={[0, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
                // autoRotate={rotating}
              />
            )}
          </group>
        </Physics>

        <Bounds
          {...boundsProps}
          onFit={(e) => console.log("transition finished", e)}
        >
          {positions && dataTexture && (
            <TileMesh
              scalePositionY={scalePositionY}
              positions={positions}
              dataTexture={dataTexture}
            />
          )}
        </Bounds>
      </Canvas>
      <div style={{ position: "relative", top: "-20px" }}>
        HGT:
        {hgtOptions.map(([label, url], idx) => (
          <button key={idx} onClick={(e) => setHgtUrl(url)}>
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
        Rotation:
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
      </div>
    </>
  );
};

export default HeightMapRandomApp3D;
