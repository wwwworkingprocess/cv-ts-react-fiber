import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { MOUSE, Vector3 } from "three";

import useGameAppStore from "./stores/useGameAppStore";

import useAppController from "./hooks/useAppController";
import useKeyboardNavigation from "./hooks/useKeyboardNavigation";
// import useWikiGeoJson from "../../hooks/wiki/useWikiGeoJson";
import useCountryNodesMemo from "./hooks/useCountryNodesMemo";
import useMapAutoPanningActions from "./hooks/useMapAutoPanning";

import CountryFeature from "./fibers/country-feature";
import CityFeatures from "./fibers/city-features";

import { Spinner } from "../../components/spinner/spinner.component";
import GameControls from "./components/game-controls/game-controls.component";

import type { WikiCountry } from "../../utils/firebase/repo/wiki-country.types";
import TreeHelper from "../../utils/tree-helper";
import { toDisplayNode } from "../../utils/wiki";

const DemographyGame3D = (props: {
  selectedCountry: WikiCountry | undefined;
  //
  path?: string;
  tree: TreeHelper;
  scrollToDetails: () => void;
}) => {
  const { tree, selectedCountry, scrollToDetails } = props;
  //
  const moving = useGameAppStore((state) => state.moving);
  const bounds = useGameAppStore((state) => state.bounds);
  const selectedCode = useGameAppStore((state) => state.selectedCode);
  const citiesMaxRangeKm = useGameAppStore((state) => state.citiesMaxRangeKm);
  const citiesMaxItems = useGameAppStore((state) => state.citiesMaxItems);
  const citiesShowPopulated = useGameAppStore(
    (state) => state.citiesShowPopulated
  );
  //
  const setSelectedCode = useGameAppStore((state) => state.setSelectedCode);
  const setZoom = useGameAppStore((state) => state.setZoom);
  //
  useKeyboardNavigation();
  //
  //
  const [MIN_X, MAX_X, MIN_Y, MAX_Y] = bounds;
  //
  useAppController(); // const { x, y, z /*, areaScale, onJump*/ } = useAppController();
  //
  const { displayedNodes } = useCountryNodesMemo(
    tree,
    selectedCode,
    citiesMaxItems,
    citiesMaxRangeKm,
    citiesShowPopulated
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
    return displayedNodes.map((n) => toDisplayNode(n, toWorldPosition));
  }, [displayedNodes]);

  //
  // zooming and panning
  //
  const [focus, setFocus] = useState(new Vector3(-17, 0 + 1, 45 + 1));
  const [extra, setExtra] = useState(false);
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
  // temporary solution, until 'moving' can be set
  // via change of 'selectedCode' or 'focus' in store
  //
  const setMoving = useGameAppStore((state) => state.setMoving);
  const setStartedMoving = useCallback(
    (towards: Vector3) => {
      if (selectedCode) setMoving(true, selectedCode);
    },
    [setMoving, selectedCode]
  );
  //
  const isNotMoving = !moving && selectedCode;
  //
  useEffect(() => {
    if (isNotMoving) setStartedMoving(focus);
  }, [focus, setStartedMoving]); // !!!

  //
  // rendered city fibers
  //
  const memoizedCities = useMemo(
    () => (
      <CityFeatures
        cities={cities}
        focus={focus}
        extra={extra}
        //
        zoomToView={zoomToView}
      />
    ),
    [cities, focus, extra, zoomToView]
  );
  //
  // const selectedWikiCountryUrl = useMemo(
  //   () => (selectedCountry ? selectedCountry.urls.geo : ""),
  //   [selectedCountry]
  // );
  //
  // const rawWikiJson = useWikiGeoJson(selectedWikiCountryUrl);
  // const firstFeatureCoordinates = useMemo(() => {
  //   if (rawWikiJson) {
  //     const arrs = rawWikiJson.data.features[0].geometry.coordinates;
  //     //
  //     return arrs;
  //   } else return [];
  // }, [rawWikiJson]);

  //
  // loading geojson
  //
  const [linesLoading, setLinesLoading] = useState<boolean>(false);
  const [features, setFeatures] = useState<Array<any>>([]);
  //
  useEffect(() => {
    const datasourceUrl = `../../data/geojson/admin1.28.geojson`;
    //
    const fetchGeoJson = (url: string) => {
      fetch(url)
        .then((res) => res.json())
        .then((data: any) => {
          const toFeature = (f: any) => f.geometry.coordinates;
          //
          const newFeatures = data.features?.map(toFeature) ?? [];
          //
          setFeatures(newFeatures);
          //
          setLinesLoading(false);
        });
    };
    //
    setLinesLoading(true);
    fetchGeoJson(datasourceUrl);
  }, []);

  //
  //
  return (
    <>
      <Suspense fallback={<Spinner />}>
        <Canvas
          style={{ height: "350px", border: "solid 1px white" }}
          frameloop="demand"
          linear
          dpr={[1, 2]}
          camera={{
            position: [19, 2, 46],
            zoom: 30,
          }}
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

          {/* Forcing font to load */}
          <Text font={"data/Roboto_Slab.ttf"}>
            {selectedCountry?.name || "..."}
          </Text>

          {/* Light Rig */}
          <group position={[-1 * MIN_X, 0, MIN_Y]}>
            <ambientLight intensity={0.2} />
            <pointLight position={[0, 10, 0]} intensity={0.5} />
          </group>

          {/* Country feature (consider position={[-1 * MIN_X, 0, MIN_Y]}) */}
          {/* <CountryFeature
            zoomToView={zoomToView}
            firstFeatureCoordinates={firstFeatureCoordinates}
            color={"blue"}
          /> */}

          {/* Admin Zone 1 features */}
          {!linesLoading ? (
            <group position={[0, 0, 0]}>
              {features.length
                ? features.map((f, idx) => (
                    <CountryFeature
                      key={idx}
                      zoomToView={zoomToView}
                      firstFeatureCoordinates={f}
                      color={"#3344ff"}
                    />
                  ))
                : null}
            </group>
          ) : null}

          {/* City features (instancedMesh + crossHair) */}
          {memoizedCities}
        </Canvas>

        {/* Game UI (DOM) */}
        <GameControls
          focus={focus}
          extra={extra}
          setExtra={setExtra}
          zoomToView={zoomToView}
          scrollToDetails={scrollToDetails}
        />
      </Suspense>
    </>
  );
};

export default DemographyGame3D;
