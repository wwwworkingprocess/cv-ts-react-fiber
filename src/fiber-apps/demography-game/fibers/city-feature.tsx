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

const formatPopulation = (p: number) => {
  if (p === -1) return "";
  if (p < 1000) return `${p}`;
  if (p < 1000000) return `${(p * 0.001).toFixed(1)}k`;
  else return `${(p * 0.000001).toFixed(1)}M`;
};

const CircularProgress = (
  props: JSX.IntrinsicElements["group"] & { progressOffset: number }
) => {
  const { progressOffset, ...groupProps } = props;
  //
  const arcProgressed = progressOffset * 2 * Math.PI;
  const arcRemains = (1 - progressOffset) * 2 * Math.PI;
  //
  return (
    <group visible={progressOffset < 1} {...groupProps}>
      <mesh
        position={[0, 0.121, 0]}
        rotation={[0, 0, Math.PI / 2]}
        scale={[1, -1, 1]}
      >
        <torusBufferGeometry
          attach="geometry"
          args={[0.0325, 0.008125, 8, 24, arcProgressed]}
        />
        <meshStandardMaterial color="#00ff00" transparent opacity={0.6} />
      </mesh>
      <mesh
        position={[0, 0.121, 0]}
        rotation={[0, 0, Math.PI / 2]}
        scale={[1, 1, 1]}
      >
        <torusBufferGeometry
          attach="geometry"
          args={[0.0325, 0.008125, 8, 24, arcRemains]}
        />
        <meshStandardMaterial color="#224422" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

const CityFeature = (
  props: JSX.IntrinsicElements["mesh"] & CityFeatureOwnProps
) => {
  const { data, zoom, zoomToView, setSelectedCode, ...meshProps } = props;
  //

  const minScale = [...data.scale];
  //const minScale = [0.13, 0.13, 0.13];
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
  // each city will receive progress from game-store (module state)
  //
  const randomProgress = Math.random();
  //
  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      onPointerDown={onClick}
      scale={[...data.scale] as any}
      {...meshProps}
    >
      {clicked && (
        <Billboard position={[0, 0.065, 0]} follow={true}>
          <CircularProgress progressOffset={randomProgress} />

          <Text
            position={[0, 0.055, 0]}
            fontSize={0.0425}
            letterSpacing={0.015}
            color={"#ff9922"}
            font={"data/Roboto_Slab.ttf"}
          >
            {formatPopulation(data.pop)}
          </Text>
          <Text
            fontSize={0.0725}
            letterSpacing={0.015}
            color={"#ffff22"}
            font={"data/Roboto_Slab.ttf"}
          >
            {data.name}
          </Text>
        </Billboard>
      )}
      <boxBufferGeometry attach="geometry" args={[0.08, 0.03, 0.08]} />
      {zoom ? (
        <meshStandardMaterial color={hover ? "white" : data.color} />
      ) : (
        <meshBasicMaterial color={hover ? "orange" : data.color} />
      )}
    </mesh>
  );
};

export default CityFeature;
