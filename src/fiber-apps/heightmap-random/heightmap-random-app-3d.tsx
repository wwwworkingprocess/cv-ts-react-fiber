import { useState, useMemo } from "react";

import { Canvas } from "@react-three/fiber";
import { generateHeightmapRandom } from "./heightmap-random.util";
import { Physics } from "@react-three/cannon";
import { Heightfield } from "../../three-components/height-field/height-field.component";
import { OrbitControls } from "@react-three/drei";

export type GenerateHeightmapArgs = {
  height: number;
  number: number;
  scale: number;
  width: number;
};

/*
class MyGeometry extends CylinderGeometry {
  constructor(rt = 0.01, rb = 0.02, h = 1) {
    super(rt, rb, h, 2, 1);

    this.translate(0, h / 2, 0);
    this.rotateX(Math.PI / 2);
  }
}

extend({ MyGeometry });
*/

const HeightMapRandomApp3D = () => {
  const [rotating, setRotating] = useState<boolean>(false);
  //
  const [scale, setScale] = useState<number>(2);
  const [number, setNumber] = useState<number>(100);
  //
  const heightMemo = useMemo(
    () =>
      generateHeightmapRandom({
        height: 100,
        number: Math.min(number, 2000),
        scale: Math.min(scale, 10),
        width: 100,
      }),
    [scale, number]
  );

  // const refHeightField = useRef<Mesh>(null!);

  return (
    <>
      <Canvas
        camera={{
          position: [5, 10, 5],
          zoom: 50,
          near: 1,
          far: 1000,
        }}
      >
        <gridHelper />
        <spotLight position={[10, 20, 10]} angle={0.15} penumbra={1} />
        <OrbitControls enableZoom={true} />

        <Physics>
          <Heightfield
            elementSize={(scale * 1) / 128}
            heights={heightMemo}
            position={[-scale / 2, 0, scale / 2]}
            rotation={[0, Math.PI / 2, 0]}
            autoRotate={rotating}
          />
        </Physics>
        {/* <Environment preset="studio" background /> */}
      </Canvas>
      <div style={{ position: "relative", top: "-20px" }}>
        Scale:{" "}
        <input
          type="number"
          value={scale}
          onChange={(e) => setScale(parseInt(e.target.value))}
        />
        Vertices:{" "}
        <input
          type="number"
          value={number}
          onChange={(e) => setNumber(parseInt(e.target.value))}
        />
        Rotation:
        <input
          type="checkbox"
          checked={rotating}
          onChange={(e) => setRotating(!rotating)}
        />
      </div>
    </>
  );
};

export default HeightMapRandomApp3D;
