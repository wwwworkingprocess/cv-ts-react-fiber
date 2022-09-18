import { useState } from "react";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import useMousePosition from "../../hooks/useMousePosition";
import EarthScene from "./earth-scene";

const GlobeApp3D = () => {
  const [rotating, setRotating] = useState<boolean>(true);
  //
  const [x, y, bind] = useMousePosition();
  const [isHighRes, setIsHighRes] = useState<boolean>(false);
  const [isSingleCountry, setIsSingleCountry] = useState<boolean>(false);
  //
  return (
    <>
      GLOBE
      <input
        type="checkbox"
        checked={rotating}
        onChange={(e) => setRotating(!rotating)}
      />
      HI-res
      <input
        type="checkbox"
        checked={isHighRes}
        onChange={(e) => setIsHighRes(!isHighRes)}
      />
      Show ALL
      <input
        type="checkbox"
        checked={!isSingleCountry}
        onChange={(e) => setIsSingleCountry(!isSingleCountry)}
      />
      {x}x{y}
      <Canvas
        {...bind}
        camera={{ position: [5, 0, 5], zoom: 50, near: 1, far: 1000 }}
      >
        <OrbitControls enableZoom={true} />

        <ambientLight intensity={0.5} />
        <pointLight position={[-10, -10, -10]} />

        <EarthScene
          rotating={rotating}
          isHighRes={isHighRes}
          isSingleCountry={isSingleCountry}
        />
      </Canvas>
    </>
  );
};

export default GlobeApp3D;
