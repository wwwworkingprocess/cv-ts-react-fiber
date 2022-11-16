import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Canvas } from "@react-three/fiber";
import { Bounds, Text } from "@react-three/drei";
import { Mesh, Vector3 } from "three";

import useGameAppStore from "./stores/useGameAppStore";

import useAppController from "./hooks/useAppController";
import useKeyboardNavigation from "./hooks/useKeyboardNavigation";
import useCountryNodesMemo from "./hooks/useCountryNodesMemo";
import useMapAutoPanningActions from "./hooks/useMapAutoPanning";

import CameraControls from "./fibers/camera-controls";
import WorldPlane from "./fibers/world-plane";
import CountryFeature from "./fibers/country-feature";
import CityFeatures from "./fibers/city-features";

import { Spinner } from "../../components/spinner/spinner.component";
import GameControls from "./components/game-controls/game-controls.component";

import type { WikiCountry } from "../../utils/firebase/repo/wiki-country.types";
import TreeHelper from "../../utils/tree-helper";
import { toDisplayNode } from "../../utils/wiki";
import useWikiGeoJson from "../../hooks/wiki/useWikiGeoJson";
import {
  getCountryBoundsByCode,
  getCountryZoomFixByCode,
} from "../../utils/country-helper";
import SelectedFeature from "./fibers/selected-feature";
import Stars from "./fibers/stars";

const DemographyGame3D = (props: {
  selectedCountry: WikiCountry | undefined;
  //
  tree: TreeHelper;
  scrollToDetails: () => void;
}) => {
  const { tree, selectedCountry, scrollToDetails } = props;
  //
  const extra = useGameAppStore((state) => state.extraZoom);
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
  const setExtra = useGameAppStore((state) => state.setExtraZoom);

  //
  useKeyboardNavigation();
  //
  //
  const [MIN_X, MAX_X, MIN_Y, MAX_Y] = bounds;
  //
  useAppController(); // const { x, y, z /*, areaScale, onJump*/ } = useAppController();
  //
  const { displayedNodes } = useCountryNodesMemo(
    selectedCountry,
    tree,
    selectedCode,
    citiesMaxItems,
    citiesMaxRangeKm,
    citiesShowPopulated
  );

  const [countryZoomFix, setCountryZoomFix] = useState<number>(0);
  useEffect(() => {
    if (selectedCountry) {
      const code = selectedCountry.code;
      const zoomFix = getCountryZoomFixByCode(code);
      //
      if (zoomFix) setCountryZoomFix(zoomFix);
    }
  }, [selectedCountry, setCountryZoomFix]);

  //
  // When selectedCountry is changing (component state),
  // updating bounds in store (module state)
  //
  const setBounds = useGameAppStore((state) => state.setBounds);
  //
  useEffect(() => {
    if (selectedCountry) {
      const code = selectedCountry.code;
      const b = getCountryBoundsByCode(code);
      //
      if (b) {
        setBounds(b);
        setZoom(false);
      }
    }
  }, [selectedCountry, setBounds, setZoom]);

  //
  // Placement helper memo, some of the components are 'flipped', kind of hacky ATM
  // Vectors for positioning fibers, depending on selectedCountry (bounds of country)
  //
  const pos = useMemo(() => {
    const v3 = (x: number, y: number, z: number) => new Vector3(x, y, z);
    const avg = (a: number, b: number) =>
      b > a ? a + (b - a) * 0.5 : b + (a - b) * 0.5;
    const lat = (y: number) => +y * 2;
    //
    const cp = { x: avg(MIN_X, MAX_X), y: lat(avg(MIN_Y, MAX_Y)) };
    //
    //
    const placement = {
      lat,
      controls: v3(cp.x, 0, cp.y),
      camera: v3(cp.x, 2, cp.y),
      crosshair: v3(-1 * cp.x, 0.001, cp.y), // in city-features
      lights: v3(-1 * cp.x, 0, cp.y),
      //
      focus: v3(-1 * cp.x - 1, 0 + 1, lat(MIN_Y + 1)),
      //
      // country: v3(0, 0, -2 * cp.y),
      country: v3(0, 0, cp.y),
      //
      defaultPanPosition: v3(
        -1 * (cp.x + 1.5) + 1,
        0 + 50,
        cp.y - 7 - 0.65 + 1
      ),
      defaultPanLookAt: v3(-1 * (cp.x + 1) + 1, 0 + 0.1, cp.y + 0.5 - 0.65 + 0),
    };
    //
    return placement;
  }, [MIN_X, MAX_X, MIN_Y, MAX_Y]);

  //
  //
  //
  const cities = useMemo(() => {
    const toWorldPosition = (node: any) => [
      -1 * node.data?.lng,
      -1 + 0.06,
      pos.lat(node.data?.lat),
    ];
    //
    return displayedNodes.map((n) => toDisplayNode(n, toWorldPosition));
  }, [displayedNodes, pos]);

  //
  // zooming and panning
  //
  const [focus, setFocus] = useState(pos.focus);
  // const [extra, setExtra] = useState(false);
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
        start={pos.crosshair}
        extraZoom={extra}
        //
        defaultPanPosition={pos.defaultPanPosition}
        defaultPanLookAt={pos.defaultPanLookAt}
        countryZoomFix={countryZoomFix}
        //
        zoomToView={zoomToView}
      />
    ),
    [
      cities,
      focus,
      extra,
      pos.crosshair,
      pos.defaultPanLookAt,
      pos.defaultPanPosition,
      zoomToView,
      countryZoomFix,
    ]
  );
  //
  const selectedWikiCountryUrl = useMemo(
    () => (selectedCountry ? selectedCountry.urls.geo : ""),
    [selectedCountry]
  );

  const rawWikiJson = useWikiGeoJson(selectedWikiCountryUrl);
  const countryCoords = useMemo(() => {
    if (rawWikiJson) {
      const arrs = rawWikiJson.data.features[0].geometry.coordinates;
      //
      return arrs;
    } else return [];
  }, [rawWikiJson]);

  //
  //
  const starsRef = useRef<Mesh>(null!);
  const fontFamily = `${process.env.PUBLIC_URL}data/Roboto_Slab.ttf`;

  //
  return (
    <>
      <Suspense fallback={<Spinner />}>
        <Canvas
          style={{ height: "350px", border: "solid 1px white" }}
          dpr={[1, 2]}
          // frameloop="demand"
          camera={{ position: pos.camera, zoom: 30, near: 1, far: 200 }}
        >
          <CameraControls position={pos.controls} selectedCode={selectedCode} />
          {/* Forcing font to load */}
          {/* <Text font={fontFamily}>{selectedCountry?.name || "..."}</Text> */}

          {/* Light Rig */}
          <group position={pos.lights}>
            <ambientLight intensity={0.33} />
            <pointLight position={[0, 10, 0]} intensity={0.5} />
          </group>

          <Stars mutableRef={starsRef} />

          {/* World feature */}
          <WorldPlane path={"../../"} />

          {/* Country feature */}
          <CountryFeature coords={countryCoords} color={"blue"} />

          {/* Selected feature's outline */}
          <SelectedFeature position={[0, 0, -1 + 0.0575]} />

          {/* Admin Zone 1 features - DISABLED, needs external datasource */}
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
