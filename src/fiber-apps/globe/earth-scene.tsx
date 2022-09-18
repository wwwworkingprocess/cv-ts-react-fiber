import { useEffect, useMemo, useState } from "react";

import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";

import EarthD3D from "./Earth3D";

import useCountryBorders from "../../hooks/3d/useCountryBorders";

const EarthScene = (
  props: JSX.IntrinsicElements["group"] & {
    rotating: boolean;
    isHighRes: boolean;
    isSingleCountry: boolean;
  }
) => {
  const { rotating, isHighRes, isSingleCountry } = props;
  //
  const { scene } = useThree();

  const [e3d, setE3d] = useState<EarthD3D>(); // helper class
  const [earth, setEarth] = useState<THREE.Mesh>(); // earth mesh reference

  const isReady = useMemo(
    () => Boolean(scene && e3d && earth),
    [scene, e3d, earth]
  );

  const { loading: loadingBorders, lineObjs } = useCountryBorders(
    isReady,
    isHighRes,
    isSingleCountry
  );

  //
  // Load earth model and store its reference once created
  //
  useEffect(() => {
    if (scene) {
      const createE3d = async () => {
        const e3d = new EarthD3D(0);
        const mesh_earth = await e3d.init(scene);
        //
        setE3d(e3d);
        setEarth(mesh_earth);
      };
      //
      createE3d(); // instantiate the 'non-functional fiber' EarthD3D
      //
      scene.matrixWorldNeedsUpdate = true;
    }
    //
    return () => {
      setE3d(undefined);
      setEarth(undefined);
    };
  }, [scene]);

  //
  // Attach mesh to scene
  //
  useEffect(() => {
    if (scene && earth) scene.add(earth);
    //
    return () => {
      if (scene && earth) {
        scene.remove(earth);
        setE3d(undefined);
        setEarth(undefined);
      }
    };
  }, [scene, earth]);

  //
  // Drawing country outlines segments into the loaded mesh
  //
  useEffect(() => {
    if (lineObjs && e3d) {
      lineObjs.forEach((obj) => e3d.mesh_lines.add(obj));
    }
    //
    return () => {
      if (lineObjs && e3d) {
        lineObjs.forEach((obj) => e3d.mesh_lines.remove(obj));
      }
    };
  }, [e3d, lineObjs]);

  //
  // Rotate the planet, once the instance is ready
  //
  useFrame((state, delta) => rotating && e3d && earth && e3d.animate(delta));
  //
  return (
    <group position={[0, 0, 15]}>
      {isReady ? (
        <Html fullscreen>
          <div>Loading assets...</div>
        </Html>
      ) : loadingBorders ? (
        <Html fullscreen>
          <div>Loading geojson data...</div>
        </Html>
      ) : null}
    </group>
  );
};

export default EarthScene;
