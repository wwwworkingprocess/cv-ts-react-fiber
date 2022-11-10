import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Group, Mesh, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";

import useGameAppStore from "../stores/useGameAppStore";

import CityBillboard from "./city-billboard";
import House from "./house";

type CityFeatureOwnProps = {
  data: any;
  //
  zoomToView: (focusRef: React.MutableRefObject<Mesh>) => void;
};

//
//
//
const CityFeature = (
  props: JSX.IntrinsicElements["group"] & CityFeatureOwnProps
) => {
  const { data, zoomToView, ...groupProps } = props;
  //
  // Component props
  //
  const { color, scale } = data;
  const code = `Q${data.code}`;
  //
  // Component state
  //
  const groupRef = useRef<Group>(null!);
  // const meshRef = useRef<Mesh>(null!);
  const meshRef = useRef<Mesh>(null!);
  const billboardRef = useRef<Group>(null!);
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
  // const isBillboardVisible = useMemo(
  //   () => isSelected || (zoom && hover),
  //   [isSelected, zoom, hover]
  // );
  const isBillboardVisible = useMemo(
    () => isSelected || hover,
    [isSelected, hover]
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
    if (meshRef.current) {
      meshRef.current.position.x = data.position[0];
      meshRef.current.position.y = data.position[1] + (isTaken ? 0.028 : 0);
      meshRef.current.position.z = data.position[2];
    }
    //
    if (groupRef.current) {
      groupRef.current.position.x = data.position[0];
      groupRef.current.position.y = data.position[1]; // + 0.005;
      groupRef.current.position.z = data.position[2];
    }
    //
    if (billboardRef.current) {
      billboardRef.current.position.x = data.position[0];
      billboardRef.current.position.y =
        data.position[1] + (isTaken ? 0.028 : 0);
      billboardRef.current.position.z = data.position[2];
    }
    //
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
    const targetRef = isTaken ? meshRef : groupRef;
    //
    if (targetRef.current) zoomToView(targetRef as any); // quick and dirty Mesh vs Group
  };

  const groupScale = useMemo(
    () =>
      new Vector3().fromArray(
        (isSelected ? [0.5, 0.5, 0.5] : [...data.scale]).map((n) => n * 0.0087)
      ),
    [isSelected, data.scale]
  );
  //
  const boxScale = useMemo(
    () =>
      new Vector3().fromArray(
        (isSelected ? [0.5, 0.5, 0.5] : [...data.scale]).map(
          (n) => n * (isTaken ? 0.71 : 1)
        )
      ),
    [isSelected, isTaken, data.scale]
  );
  //
  const extraZoom = useGameAppStore((state) => state.extraZoom);

  const billboardScale = useMemo(
    () =>
      new Vector3().fromArray(
        (zoom ? [0.5, 0.5, 0.5] : [...data.scale]).map(
          (n) => n * (extraZoom ? 0.41 : zoom ? 1 : 20)
        )
      ),
    [extraZoom, zoom, data.scale]
  );

  //
  //
  return (
    <group
      {...groupProps}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      onPointerDown={onClick}
    >
      {/* Default city feature */}
      {!isTaken ? (
        <mesh
          ref={meshRef}
          // scale={isSelected ? [0.5, 0.5, 0.5] : ([...data.scale] as any)}
          scale={boxScale}

          // {...meshProps}
        >
          <boxBufferGeometry attach="geometry" args={[0.08, 0.03, 0.08]} />
          {currentMaterial}
        </mesh>
      ) : null}

      {/* City is taken */}
      {isTaken ? (
        <group ref={groupRef} scale={groupScale}>
          <House />
        </group>
      ) : null}

      {/* Billboard Feature */}
      {isBillboardVisible && (
        <group ref={billboardRef} scale={billboardScale}>
          <CityBillboard
            data={data}
            isTaken={isTaken}
            showProgress={zoom}
            progressOffset={progressOffset}
          />
        </group>
      )}
    </group>
  );
};

export default CityFeature;
