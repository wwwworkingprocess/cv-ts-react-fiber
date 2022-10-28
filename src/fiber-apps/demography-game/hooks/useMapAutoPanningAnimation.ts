import { useFrame } from "@react-three/fiber";

import { Mesh, Vector3 } from "three";

const vDef = [-21 + 1, 0 + 50, 40 - 0.65 + 1];
const vDef2 = [-20.5 + 1, 0 + 0.1, 47.5 - 0.65 + 0];
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
  focus: Vector3
) => {
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
      positionVec.set(vDef[0], vDef[1], vDef[2]);
      lookatVec.set(vDef2[0], vDef2[1], vDef2[2]);
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
      if (camera.zoom > 25) camera.zoom -= 0.55;
    }
  });
};

export default useMapAutoPanningAnimation;
