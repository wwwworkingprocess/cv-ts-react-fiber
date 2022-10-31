import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { isMobile } from "react-device-detect";

import { Mesh, Vector3 } from "three";

// const vDef = [-21 + 1, 0 + 50, 40 - 0.65 + 1];
// const vDef2 = [-20.5 + 1, 0 + 0.1, 47.5 - 0.65 + 0];
//
const positionVec = new Vector3();
const lookatVec = new Vector3();

//
// auto zooming and panning, using the provided setters
//
const useMapAutoPanningAnimation = (
  crosshair: React.MutableRefObject<Mesh<any>>,
  //
  zoom: boolean,
  extraZoom: boolean,
  focus: Vector3,
  //
  defaultPanPosition: Vector3,
  defaultPanLookAt: Vector3,
  //
  countryZoomFix: number
) => {
  const applizedZoom = useMemo(
    () => Math.max(0, (25 - countryZoomFix) * (isMobile ? 0.75 : 1)),
    [countryZoomFix]
  );
  //
  useFrame((state) => {
    const step = 0.01;
    //
    const camera = state.camera;
    const cross = crosshair.current;
    //
    if (zoom) {
      positionVec.set(focus.x, focus.y, focus.z + 0.001);
      lookatVec.set(focus.x, focus.y, focus.z - 0.001);
    } else {
      const vDef = defaultPanPosition;
      const vDef2 = defaultPanLookAt;

      positionVec.set(vDef.x, vDef.y, vDef.z);
      lookatVec.set(vDef2.x, vDef2.y, vDef2.z);
      // positionVec.set(vDef[0], vDef[1], vDef[2]);
      // lookatVec.set(vDef2[0], vDef2[1], vDef2[2]);
    }
    //
    //
    camera.position.lerp(positionVec, step);
    cross.position.lerp(lookatVec, step);
    //
    const cp = cross.position; // retrieving updated value
    //
    camera.lookAt(cp.x, cp.y, cp.z);
    cross.updateMatrix();
    camera.updateProjectionMatrix();
    //
    // animate viewport
    //
    if (zoom) {
      if (extraZoom) {
        if (camera.zoom < 180) camera.zoom += 0.85;
      } else {
        if (camera.zoom < 120) camera.zoom += 0.25;
        if (camera.zoom > 121) camera.zoom -= 0.85;
      }
    } else {
      if (camera.zoom > applizedZoom) camera.zoom -= 0.45;
      if (camera.zoom < applizedZoom - 1) camera.zoom += 0.45;
    }
  });
};

export default useMapAutoPanningAnimation;
