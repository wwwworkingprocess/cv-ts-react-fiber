// import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";

import EarthD3D from "../../Earth3D";

import useCountryBorders from "../../hooks/3d/useCountryBorders";
import useMousePosition from "../../hooks/useMousePosition";

const Scene = ({ locale, rotating }: any) => {
  const { scene } = useThree();

  const [e3d, setE3d] = useState<EarthD3D>();
  const [earth, setEarth] = useState<THREE.Mesh>();

  const ref = useRef<THREE.Group>(null!);

  const d3dLoading = useMemo(
    () => !Boolean(scene) || !Boolean(e3d) || !Boolean(earth),
    [scene, e3d, earth]
  );

  const { loading: loadingBorders, lineObjs } = useCountryBorders(
    scene,
    e3d,
    true // false - low res (177)    true - high res (4647)
  );

  useEffect(() => {
    if (ref.current && scene) {
      const createE3d = async () => {
        const e3d = new EarthD3D(0);
        const mesh_earth = await e3d.init(scene);
        //
        setE3d(e3d);
        setEarth(mesh_earth);
      };
      //
      createE3d();
      //
      scene.matrixWorldNeedsUpdate = true;
    }
    //
    return () => {
      scene.clear();
      //
      setE3d(undefined);
      setEarth(undefined);
    };
  }, [scene]);

  useEffect(() => {
    if (scene && earth) scene.add(earth);
  }, [scene, earth]);

  useFrame((state, delta) => {
    if (rotating && e3d && earth) e3d.animate(delta);
  });

  //
  return loadingBorders ? (
    <Html fullscreen>
      <div>Loading geojson data...</div>
    </Html>
  ) : (
    <>
      <group position={[0, 0, 15]} ref={ref}></group>
      {d3dLoading ? (
        <Html fullscreen>
          <div>Loading assets...</div>
        </Html>
      ) : (
        <Html>
          <div>{lineObjs ? lineObjs.length : 0} items</div>
        </Html>
      )}
    </>
  );
};

const GlobeApp3D = () => {
  const [rotating, setRotating] = useState<boolean>(true);
  //
  const [x, y, bind] = useMousePosition();
  //
  return (
    <>
      GLOBE
      <input
        type="checkbox"
        checked={rotating}
        onChange={(e) => setRotating(!rotating)}
      />
      {x}x{y}
      <Canvas
        {...bind}
        camera={{ position: [5, 0, 5], zoom: 50, near: 1, far: 1000 }}
      >
        <OrbitControls enableZoom={true} />

        <ambientLight intensity={0.5} />
        <pointLight position={[-10, -10, -10]} />

        <Scene position={[0, 0, 0]} rotating={rotating} />
      </Canvas>
    </>
  );
};

export default GlobeApp3D;
