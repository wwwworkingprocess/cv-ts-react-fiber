import { useEffect, useRef } from "react";

import { Group } from "three";
import { useLoader } from "@react-three/fiber";

import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";

import house from "../../../assets/gltf/house/house.glb";

type HouseOwnProps = {
  // color: React.MutableRefObject<Mesh<any, any>>;
};

const House = (
  props: JSX.IntrinsicElements["group"]
  // & HouseOwnProps
) => {
  const gltf = useLoader(GLTFLoader, house);

  const groupRef = useRef<Group>(null!);

  useEffect(() => {
    const afterLoaded = (gltf: GLTF) => {
      const clone = SkeletonUtils.clone(gltf.scene);
      //
      groupRef.current.add(clone);
    };
    //
    //
    if (gltf) afterLoaded(gltf as any);
  }, [gltf]);
  //
  //
  //
  return (
    <group
      ref={groupRef}
      scale={[0.1, 0.1, 0.1]}
      rotation={[0, -Math.PI / 2, 0]}
    ></group>
  );
};

export default House;
