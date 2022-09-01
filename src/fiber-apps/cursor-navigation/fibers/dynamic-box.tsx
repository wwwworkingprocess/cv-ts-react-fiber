//import { DoubleSide } from "three";

import { RoundedBox } from "@react-three/drei";
import { Vector3 } from "three";

//type Rbt = React.ForwardRefExoticComponent<Pick<Props, "visible" | "attach" | "args" | "children" | "key" | "onUpdate" | "position" | "up" | "scale" | "rotation" | "matrix" | "quaternion" | "layers" | "dispose" | "type" | "id" | "uuid" | "name" | "parent" | "modelViewMatrix" | "normalMatrix" | "matrixWorld" | "matrixAutoUpdate" | "matrixWorldNeedsUpdate" | "castShadow" | "receiveShadow" | "frustumCulled" | "renderOrder" | "animations" | "userData" | "customDepthMaterial" | "customDistanceMaterial" | "isObject3D" | "onBeforeRender" | "onAfterRender" | "applyMatrix4" | "applyQuaternion" | "setRotationFromAxisAngle" | "setRotationFromEuler" | "setRotationFromMatrix" | "setRotationFromQuaternion" | "rotateOnAxis" | "rotateOnWorldAxis" | "rotateX" | "rotateY" | "rotateZ" | "translateOnAxis" | "translateX" | "translateY" | "translateZ" | "localToWorld" | "worldToLocal" | "lookAt" | "add" | "remove" | "removeFromParent" | "clear" | "getObjectById" | "getObjectByName" | "getObjectByProperty" | "getWorldPosition" | "getWorldQuaternion" | "getWorldScale" | "getWorldDirection" | "raycast" | "traverse" | "traverseVisible" | "traverseAncestors" | "updateMatrix" | "updateMatrixWorld" | "updateWorldMatrix" | "toJSON" | "clone" | "copy" | "addEventListener" | "hasEventListener" | "removeEventListener" | "dispatchEvent" | keyof import("@react-three/fiber/dist/declarations/src/core/events").EventHandlers | "material" | "geometry" | "morphTargetInfluences" | "morphTargetDictionary" | "isMesh" | "updateMorphTargets" | "radius" | "steps" | "smoothness"> & React.RefAttributes<Mesh<import("three").BufferGeometry, import("three").Material | import("three").Material[]>>>;

const DynamicBox = (props: {
  areaScale: Vector3;
  position?: Vector3 | [number, number, number];
  //countryBorderPoints: Array<[number, number]> | null;
}) => {
  const { areaScale, position } = props;
  //
  return areaScale ? (
    <RoundedBox
      position={position}
      scale={areaScale}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      castShadow
      {...props}
    >
      <meshStandardMaterial color={"#44aaff"} />
    </RoundedBox>
  ) : null;
};

export default DynamicBox;
