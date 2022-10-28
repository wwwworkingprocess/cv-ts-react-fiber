import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";

import useGameAppStore from "../stores/useGameAppStore";

import CityBillboard from "./city-billboard";

type CityFeatureOwnProps = {
  data: any;
  //
  zoomToView: (focusRef: React.MutableRefObject<Mesh>) => void;
};

//
//
//
const CityFeature = (
  props: JSX.IntrinsicElements["mesh"] & CityFeatureOwnProps
) => {
  const { data, zoomToView, ...meshProps } = props;
  //
  // Component props
  //
  const { color, scale } = data;
  const code = `Q${data.code}`;
  //
  // Component state
  //
  const meshRef = useRef<Mesh>(null!);
  //
  const [hover, setHover] = useState(false);
  //
  // Store variables
  //
  const zoom = useGameAppStore((s) => s.zoom);
  const selectedCode = useGameAppStore((s) => s.selectedCode);
  const userColor = useGameAppStore((s) => s.userColor);
  const isTaken = useGameAppStore((s) => s.codesTaken.includes(code));
  const myProgressConverting = useGameAppStore(
    (s) => s.progressConverting[code] ?? 0
  );
  //
  const setSelectedCode = useGameAppStore((s) => s.setSelectedCode);
  const setProgressCompleted = useGameAppStore((s) => s.setProgressCompleted);
  //
  // Derived properties
  //
  const isSelected = selectedCode === code;
  const population = data.pop < 1 ? 100 : data.pop; // 1 instead of -1 so, feature won't autocomplete once appears
  const populationLeft = Math.max(0, population - myProgressConverting);
  const progressOffset = 1 - populationLeft / (population || populationLeft);
  const isConversionComplete = progressOffset === 1;
  //
  const maxScale = !isTaken ? 1.15 : zoom ? 0.21 : 0.02;
  const minScale =
    (isTaken && isSelected ? 1.5 : isSelected ? 2 : isTaken ? 0.5 : 1) *
    scale[0];

  //
  // Progress indicator, true after progress reaches or passes 100%
  //
  const isFinished = useMemo(
    () => !isTaken && isConversionComplete,
    [isTaken, isConversionComplete]
  );

  //
  // Show billboard for selected item, or when hovering in zoomed mode
  //
  const isBillboardVisible = useMemo(
    () => isSelected || (zoom && hover),
    [isSelected, zoom, hover]
  );

  //
  // Current color of the feature, depending on its state
  //
  const currentColor = useMemo(() => {
    if (zoom) {
      //
      if (hover) return "white";
      if (isSelected) return "orange";
      if (isTaken) return userColor;
    } else {
      if (hover) return "orange";
    }
    //
    return color;
  }, [zoom, isTaken, isSelected, hover, userColor, color]);

  //
  // Current material, used by this feature
  //
  const currentMaterial = useMemo(
    () =>
      zoom && !isTaken ? (
        <meshStandardMaterial color={currentColor} />
      ) : (
        <meshBasicMaterial color={currentColor} />
      ),
    [zoom, isTaken, currentColor]
  );

  //
  // Occurs once, when the progress reaches or passes 100%
  //
  useEffect(() => {
    isFinished && setProgressCompleted(code, population);
  }, [isFinished, setProgressCompleted, code, population]);

  //
  // Apply appropriate cursor, when hovering over the mesh
  //
  useEffect(() => {
    document.body.style.cursor = hover ? "pointer" : "default";
  }, [hover]);

  //
  // Placing current feature, before rendering frame
  //
  useLayoutEffect(() => {
    meshRef.current.position.x = data.position[0];
    meshRef.current.position.y = data.position[1];
    meshRef.current.position.z = data.position[2];
  });

  //
  // Animating item size
  //
  useFrame((state) => {
    const m = meshRef.current;
    //
    const needsScaleUp = m && !zoom && m.scale.x < maxScale;
    const needsScaleDown = m && zoom && m.scale.x > minScale;
    //
    if (needsScaleUp) m.scale.multiplyScalar(1.01);
    else if (needsScaleDown) m.scale.multiplyScalar(0.99);
  });

  //
  // Selecting feature and zooming towards it, once clicked
  //
  const onClick = () => {
    setSelectedCode(code);
    //
    zoomToView(meshRef);
  };

  //
  //
  //
  return (
    <mesh
      ref={meshRef}
      scale={isSelected ? [0.5, 0.5, 0.5] : ([...data.scale] as any)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      onPointerDown={onClick}
      {...meshProps}
    >
      <boxBufferGeometry attach="geometry" args={[0.08, 0.03, 0.08]} />
      {currentMaterial}

      {isBillboardVisible && (
        <CityBillboard
          data={data}
          isTaken={isTaken}
          progressOffset={progressOffset}
        />
      )}
    </mesh>
  );
};

export default CityFeature;
