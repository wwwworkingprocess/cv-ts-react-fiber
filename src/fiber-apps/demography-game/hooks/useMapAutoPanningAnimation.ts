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
  crosshairMesh: React.MutableRefObject<Mesh<any>>,
  //
  zoom: boolean,
  extra: boolean,
  focus: Vector3
) => {
  //
  useFrame((state) => {
    const step = 0.01;
    //
    zoom
      ? positionVec.set(focus.x, focus.y, focus.z + 0.001)
      : positionVec.set(vDef[0], vDef[1], vDef[2]);
    //
    zoom
      ? lookatVec.set(focus.x, focus.y, focus.z - 0.001)
      : lookatVec.set(vDef2[0], vDef2[1], vDef2[2]);
    //
    state.camera.position.lerp(positionVec, step);
    crosshairMesh.current.position.lerp(lookatVec, step);
    //
    const cp = crosshairMesh.current.position;
    //
    state.camera.lookAt(cp.x, cp.y, cp.z);
    crosshairMesh.current.updateMatrix();
    state.camera.updateProjectionMatrix();
    //
    // animate viewport
    //
    if (zoom) {
      if (extra) {
        if (state.camera.zoom < 180) state.camera.zoom += 0.45;
      } else {
        if (state.camera.zoom < 120) state.camera.zoom += 0.25;
        if (state.camera.zoom > 121) state.camera.zoom -= 0.45;
      }
    } else {
      if (state.camera.zoom > 25) state.camera.zoom -= 0.3;
    }
  });
};

export default useMapAutoPanningAnimation;
