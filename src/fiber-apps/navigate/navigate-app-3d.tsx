import { useCallback, useMemo, useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import { Canvas } from "@react-three/fiber";

import Box from "../../three-components/box/box.component";
import Camera from "../Camera";
import { Vector3Tuple } from "three";

const NavigateApp3D = (props: {
  navigate: NavigateFunction;
  path?: string;
}) => {
  const { navigate, path } = props;
  //
  const relativePath = useCallback(
    (endpoint: string) => `${path ? `${path}/` : ""}${endpoint}`,
    [path]
  );
  //
  const gotoCoursesHandler = useCallback(
    () => navigate(relativePath("courses")),
    [navigate, relativePath]
  );
  const gotoAuthHandler = useCallback(
    () => navigate(relativePath("auth")),
    [navigate, relativePath]
  );

  const [perspectiveTarget, setPerspectiveTarget] = useState<Vector3Tuple>([
    0, 0, 0,
  ]);

  const controlledCameraPropsMemo = useMemo(() => {
    const controlledCameraProps = {
      perspectivePosition: [0, 2, 10],
      perspectiveTarget: perspectiveTarget,
      orthographicPosition: [0, 2, 0],
      orthographicTarget: [0, 0, 0],
    } as {
      perspectivePosition: Vector3Tuple | undefined;
      perspectiveTarget: Vector3Tuple | undefined;
      orthographicPosition: Vector3Tuple | undefined;
      orthographicTarget: Vector3Tuple | undefined;
    };
    //
    return controlledCameraProps;
  }, [perspectiveTarget]);
  //

  return (
    <>
      <button onClick={(e) => setPerspectiveTarget([-3.6, 0, 0])}>
        Click me 1
      </button>
      <button onClick={(e) => setPerspectiveTarget([3.6, 0, 0])}>
        Click me
      </button>
      <Canvas frameloop="demand" shadows dpr={[1, 2]}>
        <Camera {...controlledCameraPropsMemo} />

        {/* <ambientLight intensity={0.5} /> */}
        <spotLight position={[10, 20, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />

        <Box
          tooltipText={"A"}
          position={[-3.6, 0, 0]}
          onNavigate={gotoCoursesHandler}
        />
        <Box
          tooltipText={"B"}
          position={[-1.2, 0, 0]}
          onNavigate={gotoCoursesHandler}
        />
        <Box
          tooltipText={"C"}
          position={[1.2, 0, 0]}
          onNavigate={gotoAuthHandler}
        />
        <Box
          tooltipText={"D"}
          position={[3.6, 0, 0]}
          onNavigate={gotoAuthHandler}
        />
      </Canvas>
    </>
  );
};

export default NavigateApp3D;
