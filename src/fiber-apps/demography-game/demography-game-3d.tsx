import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { isMobile } from "react-device-detect";

import { Canvas } from "@react-three/fiber";
import { Billboard, OrbitControls, Text } from "@react-three/drei";
import { Mesh, Vector3 } from "three";

import useGameAppStore from "./stores/useGameAppStore";
import useAppController from "./hooks/useAppController";
import useKeyboardNavigation from "./hooks/useKeyboardNavigation";

// import Floor from "./fibers/floor";
import Player from "./fibers/player";
import FrameCounter from "./fibers/frame-counter";
import CityFeatures from "./fibers/city-features";

// import AxisValueInput from "./components/axis-value-input";
import { Spinner } from "../../components/spinner/spinner.component";

import type { WikiCountry } from "../../utils/firebase/repo/wiki-country.types";

import TreeHelper from "../../utils/tree-helper";
import { ControlsContainer } from "./demography-game-3d.styles";
import useCountryNodesMemo from "./hooks/useCountryNodesMemo";
import useMapAutoPanningActions from "./hooks/useMapAutoPanning";

const DemographyGame3D = (props: {
  isCameraEnabled: boolean;
  isFrameCounterEnabled: boolean;
  selectedCountry: WikiCountry | undefined;
  selectedCode: string | undefined;
  path?: string;
  tree: TreeHelper;
  //
  setSelectedCode: React.Dispatch<string | undefined>;
}) => {
  const {
    tree,
    isCameraEnabled,
    isFrameCounterEnabled,
    selectedCode,
    setSelectedCode,
  } = props;
  //
  useKeyboardNavigation();
  //
  const bounds = useGameAppStore((state) => state.bounds);
  const [MIN_X, MAX_X, MIN_Y, MAX_Y] = bounds;
  //
  const { x, y, z, areaScale, onJump } = useAppController();
  //
  const MAX_RANGE_TO_SHOW = 50;
  const MAX_ITEMS_TO_SHOW = 400;
  //
  const { displayedNodes } = useCountryNodesMemo(
    tree,
    selectedCode,
    MAX_ITEMS_TO_SHOW,
    MAX_RANGE_TO_SHOW
  );

  //
  //
  //
  const cities = useMemo(() => {
    const toWorldPosition = (node: any) => [
      -1 * node.data?.lng,
      -1 + 0.06,
      node.data?.lat,
    ];
    const toItem = (node: any) => ({
      code: node.code,
      name: node.name,
      position: toWorldPosition(node),
      color: selectedCode === `Q${node.code}` ? "blue" : "red",
      //
      isSelected: selectedCode === `Q${node.code}`,
    });
    //
    return displayedNodes.map(toItem);
  }, [displayedNodes, selectedCode]);

  //
  // zooming and panning
  //
  const [zoom, setZoom] = useState<boolean>(selectedCode !== undefined);
  const [focus, setFocus] = useState(new Vector3(-17, 0 + 1, 45 + 1));
  //
  const { zoomToView, zoomToViewByCode } = useMapAutoPanningActions(
    cities,
    setZoom,
    setFocus,
    setSelectedCode
  );

  //
  // fire appropriate callback as selectedCode is changing
  //
  useEffect(() => {
    selectedCode ? zoomToViewByCode(selectedCode) : zoomToView(undefined);
  }, [selectedCode, zoomToViewByCode, zoomToView]);

  //
  // rendered city fibers
  //
  const memoizedCities = useMemo(
    () => (
      <CityFeatures
        cities={cities}
        focus={focus}
        zoom={zoom}
        //
        setZoom={setZoom}
        setFocus={setFocus}
        zoomToView={zoomToView}
        setSelectedCode={setSelectedCode}
      />
    ),
    [cities, zoom, focus, setSelectedCode, zoomToView]
  );

  //
  //
  //
  return (
    <>
      <ControlsContainer>
        {zoom && (
          <button onClick={(e) => focus && zoomToView(undefined)}>
            Zoom out
          </button>
        )}
        {/* {!zoom && (
          <button onClick={(e) => focus && zoomToViewByCode(selectedCode)}>
            Zoom In
          </button>
        )} */}
        {/* <AxisValueInput axis={"x"} min={MIN_X} max={MAX_X} /> */}
        {/* <AxisValueInput axis={"y"} min={0} max={10} /> */}
        {/* <AxisValueInput axis={"z"} min={MIN_Y} max={MAX_Y} /> */}
        {isMobile ? <button onClick={onJump}>Jump</button> : undefined}
      </ControlsContainer>
      <Suspense fallback={<Spinner />}>
        <Canvas
          style={{ height: "350px", border: "solid 1px white" }}
          linear
          dpr={[1, 2]}
          camera={{ position: [19, 2, 46], zoom: 30 }}
        >
          <OrbitControls
            enableZoom={false}
            position={[19, 0, 46]}
            minPolarAngle={0}
            maxPolarAngle={(Math.PI / 7) * 2}
            maxDistance={100}
          />
          <gridHelper />
          <group position={[-1 * MIN_X, 0, MIN_Y]}>
            <pointLight position={[0, 10, 0]} intensity={0.5} />
          </group>
          {memoizedCities}
          <Player x={x} y={y} z={z} position={[0, -0.5 + 0.05, 0]} />
          <FrameCounter enabled={isFrameCounterEnabled} />
          {!isMobile && (
            <Billboard position={[0, 2.25, 0]} follow={true}>
              <Text fontSize={0.3} color={"#ffaa22"}>
                {/* Use arrow keys for navigation */}
                {JSON.stringify([MIN_X, MAX_X, MIN_Y, MAX_Y])}
              </Text>
            </Billboard>
          )}

          {/* <Floor
            areaScale={areaScale}
            position={[
              -1 * (MIN_X + (MAX_X - MIN_X) * 0.5),
              0,
              MIN_Y + (MAX_Y - MIN_Y) * 0.5,
            ]}
          /> */}
        </Canvas>
      </Suspense>
    </>
  );
};

export default DemographyGame3D;
