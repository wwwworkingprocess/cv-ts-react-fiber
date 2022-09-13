import { useLayoutEffect, useMemo, useRef } from "react";
import { Text3D } from "@react-three/drei";
import * as THREE from "three";

// import Roboto from "../../Roboto_Regular.json";

const vAlign = "center";
const hAlign = "center";
const size = 1.5;

const MyText = ({
  children,
  fontSize,
  bevelSize,
  fontColor,
  ...props
}: any) => {
  const config = useMemo(
    () => ({
      size: 4 * fontSize,
      height: 3,
      curveSegments: 32,
      bevelEnabled: true,
      bevelThickness: 0.6 * fontSize,
      bevelSize: bevelSize * fontSize,
      bevelOffset: 0,
      bevelSegments: 8,
    }),
    [fontSize, bevelSize]
  );
  const mesh = useRef<THREE.Mesh>(null!);
  //
  useLayoutEffect(() => {
    const size = new THREE.Vector3();
    //
    if (mesh.current) {
      mesh.current.geometry.computeBoundingBox();
      if (mesh.current.geometry.boundingBox) {
        mesh.current.geometry.boundingBox.getSize(size);
      }
      //
      mesh.current.position.x =
        hAlign === "center" ? -size.x / 2 : hAlign === "right" ? 0 : -size.x;
      mesh.current.position.y =
        vAlign === "center" ? -size.y / 2 : vAlign === "top" ? 0 : -size.y;
    }
  }, [children]);

  //
  return (
    <group {...props} scale={[0.1 * size, 0.1 * size, 0.1 * bevelSize * size]}>
      <Text3D ref={mesh} font={"data/Roboto_Regular.json"} {...config}>
        {children}
        <meshLambertMaterial color={fontColor} />
      </Text3D>
    </group>
  );
};

export default MyText;
