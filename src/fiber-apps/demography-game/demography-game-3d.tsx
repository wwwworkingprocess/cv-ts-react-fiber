import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { isMobile } from "react-device-detect";

import { Canvas } from "@react-three/fiber";
import { Billboard, OrbitControls, Text, useHelper } from "@react-three/drei";
import { BoxHelper, Color, Group, MOUSE, Vector3 } from "three";

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
import CountryBorder from "./fibers/country-border";
import useWikiGeoJson from "../../hooks/wiki/useWikiGeoJson";

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
    // isCameraEnabled,
    isFrameCounterEnabled,
    selectedCountry,
    selectedCode,
    setSelectedCode,
  } = props;
  //
  useKeyboardNavigation();
  //
  const bounds = useGameAppStore((state) => state.bounds);
  const [MIN_X, MAX_X, MIN_Y, MAX_Y] = bounds;
  //
  const { x, y, z /*, areaScale, onJump*/ } = useAppController();
  //
  const MAX_RANGE_TO_SHOW = 50;
  const MAX_ITEMS_TO_SHOW = isMobile ? 300 : 500;
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
    //
    const colorByPop = (node: any) => {
      const toValue = (node: any): number =>
        Math.log(Math.max(0, node?.data?.pop ?? 0)) * 14 + 10;
      const [r, g, b] = [
        Math.max(0, 155 - toValue(node) * 0.35),
        toValue(node),
        0,
      ];
      //
      const hex = new Color(r / 256, g / 256, b / 256).getHexString();
      //
      return `#${hex}`;
    };
    //
    const scaleByPop = (node: any) => {
      const toValue = (node: any): number =>
        Math.log(Math.max(0, node?.data?.pop ?? 0)) * 0.25;
      //
      const v = Math.max(0.1, toValue(node)) * 0.12;
      //
      return [v, v, v];
    };
    //
    const toItem = (node: any) => ({
      code: node.code,
      name: node.name,
      pop: node.data.pop,
      position: toWorldPosition(node),
      color: selectedCode === `Q${node.code}` ? "orange" : colorByPop(node),
      scale:
        selectedCode === `Q${node.code}`
          ? [0.51, 0.51, 0.51]
          : scaleByPop(node),
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

  const selectedWikiCountryUrl = useMemo(
    () => (selectedCountry ? selectedCountry.urls.geo : ""),
    [selectedCountry]
  );
  //
  const rawWikiJson = useWikiGeoJson(selectedWikiCountryUrl);
  const firstFeatureCoordinates = useMemo(() => {
    if (rawWikiJson) {
      const arrs = rawWikiJson.data.features[0].geometry.coordinates;
      //
      return arrs;
    } else return [];
  }, [rawWikiJson]);
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
      </ControlsContainer>
      <Suspense fallback={<Spinner />}>
        <Canvas
          style={{ height: "350px", border: "solid 1px white" }}
          linear
          dpr={[1, 2]}
          camera={{ position: [19, 2, 46], zoom: 30 }}
        >
          <OrbitControls
            makeDefault
            position={[19, 0, 46]}
            panSpeed={0.061}
            enableDamping={false}
            enablePan={selectedCode !== undefined}
            enableZoom={selectedCode !== undefined}
            enableRotate={false}
            minPolarAngle={0}
            maxPolarAngle={(Math.PI / 7) * 2}
            maxZoom={100}
            maxDistance={100}
            mouseButtons={{
              LEFT: MOUSE.PAN,
              MIDDLE: MOUSE.ROTATE,
              RIGHT: MOUSE.DOLLY,
            }}
          />
          <gridHelper />
          <ambientLight intensity={0.2} />
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
          {/* ref={groupRef} */}
          <group>
            {/* <group position={[-1 * MIN_X, 0, MIN_Y]}> */}
            <PlacedCountry
              zoomToView={zoomToView}
              firstFeatureCoordinates={firstFeatureCoordinates}
            />
          </group>

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

const PlacedCountry = ({
  firstFeatureCoordinates,
  zoomToView,
}: {
  firstFeatureCoordinates: any;
  zoomToView: any;
}) => {
  const groupToStageRotation = [-Math.PI / 2, 0, 0];
  //
  const groupRef = useRef<Group>(null!);
  useHelper(groupRef, BoxHelper, "red");
  //

  return (
    <group position={[0, 0, 0]} scale={[1, 0.01, 1]}>
      <group rotation={groupToStageRotation as any}>
        <group ref={groupRef} position={[0, 0, -95]}>
          {firstFeatureCoordinates && (
            <>
              {firstFeatureCoordinates.map(
                (coords: Array<[number, number]>, idx: number) => {
                  const isNested = coords.length === 1;
                  const points = (isNested ? coords[0] : coords) as Array<
                    [number, number]
                  >;
                  //
                  return (
                    <CountryBorder
                      key={idx}
                      countryBorderPoints={points}
                      showFeatureBounds={true}
                      color={new Color("blue")}
                      capitalRef={undefined}
                    />
                  );
                }
              )}
            </>
          )}
        </group>
      </group>
    </group>
  );
};

export default DemographyGame3D;
