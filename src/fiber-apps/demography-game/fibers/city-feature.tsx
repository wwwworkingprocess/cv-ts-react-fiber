import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Billboard, Text } from "@react-three/drei";

import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";

type CityFeatureOwnProps = {
  data: any;
  //
  zoom: boolean;
  //
  zoomToView: (focusRef: React.MutableRefObject<Mesh>) => void;
  setSelectedCode: React.Dispatch<string | undefined>;
};

const CityFeature = (
  props: JSX.IntrinsicElements["mesh"] & CityFeatureOwnProps
) => {
  const { data, zoom, zoomToView, setSelectedCode, ...meshProps } = props;
  //
  const minScale = [0.13, 0.13, 0.13];
  const maxScale = [1.15, 1.15, 1.15];
  const noPopulationInfo = data.pop < 1;
  //
  const meshRef = useRef<Mesh>(null!);
  //
  const [hover, setHover] = useState(false);
  const [clicked, setClicked] = useState(data.isSelected);
  //
  useEffect(() => {
    document.body.style.cursor = hover ? "pointer" : "default";
  }, [hover]);
  //
  useLayoutEffect(() => {
    meshRef.current.position.x = data.position[0];
    meshRef.current.position.y = data.position[1];
    meshRef.current.position.z = data.position[2];
  });
  //
  // animate item size
  //
  useFrame((state) => {
    if (meshRef.current) {
      if (!zoom) {
        if (meshRef.current.scale.x < maxScale[0])
          meshRef.current.scale.multiplyScalar(1.01);
      } else {
        if (meshRef.current.scale.x > minScale[0])
          meshRef.current.scale.multiplyScalar(0.99);
      }
    }
  });
  //
  const onClick = () => {
    setClicked(!clicked);
    zoomToView(meshRef);
    //
    setSelectedCode(`Q${data.code}`);
  };
  //
  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      onPointerDown={onClick}
      scale={[1 / 4, 1 / 4, 1 / 4]}
      {...meshProps}
    >
      {clicked && (
        <Billboard position={[0, 0.035, 0]} follow={true}>
          <Text fontSize={0.13} color={"#ffaa22"}>
            {data.name}
          </Text>
        </Billboard>
      )}
      <boxBufferGeometry attach="geometry" args={[0.08, 0.03, 0.08]} />
      <meshStandardMaterial
        color={hover ? "white" : noPopulationInfo ? "silver" : data.color}
      />
    </mesh>
  );
};

export default CityFeature;
