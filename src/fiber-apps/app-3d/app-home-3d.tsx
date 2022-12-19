import { useRef, useMemo, Suspense, useState } from "react";

import { Canvas, useFrame } from "@react-three/fiber";

import {
  Billboard,
  Bounds,
  OrbitControls,
  Sky,
  Text,
  useHelper,
} from "@react-three/drei";

import MyText from "../../three-components/text-3d/text-3d.component";
import { Color, SpotLight, SpotLightHelper } from "three";

import { ShaderPlaneMesh } from "../../three-components/image-plane/shader-material";
import GridFloor from "../heightmap-random/fibers/grid/grid-floor";
import Boxes from "./fibers/boxes";
import { Draggable } from "../../three-components/draggable/draggable.component";
import { Spinner } from "../../components/spinner/spinner.component";
import { WikiCountry } from "../../utils/firebase/repo/wiki-country.types";
import { distanceFromCoords } from "../../utils/geo";
import { getAvailableCountryCodes } from "../../utils/country-helper";

const MovingSpotLight = (props: JSX.IntrinsicElements["spotLight"]) => {
  const { castShadow } = props;
  //
  const ref = useRef<SpotLight>(null!);
  //
  useFrame(({ clock }) => {
    const tick = clock.elapsedTime * 0.25;
    //
    if (ref.current) ref.current.position.x = Math.sin(tick) * 4;
    if (ref.current) ref.current.position.z = Math.cos(tick) * 7;
    if (ref.current) ref.current.position.y = 2.5 + Math.cos(tick) * 1.25;
    //
    ref.current.intensity = 3;
  });
  //
  useHelper(ref, SpotLightHelper);
  //
  return (
    <spotLight
      ref={ref}
      color={0xfff1b0}
      position={[6, 0.1, 6]}
      angle={0.75}
      penumbra={0.72}
      castShadow={castShadow}
      shadowCameraNear={0.005}
      shadowCameraFar={15}
      shadow-mapSize-height={2048}
      shadow-mapSize-width={2048}
    />
  );
};

type AppHome3DProps = {
  isShadowEnabled: boolean;
  showGrid: boolean;
  countries: Array<WikiCountry>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const availableCountryCodes = getAvailableCountryCodes();

const AppHome3D = (props: AppHome3DProps) => {
  const { showGrid, isShadowEnabled, countries } = props;
  //
  const refDrag = useRef<boolean>(false);
  const refDynamicText = useRef<string>("");
  const controlsRef = useRef<any>(null!);
  //
  const [boxGeoPosition, setBoxGeoPosition] = useState<
    [number, number] | undefined
  >([0, 0]);
  //
  const dragProps = {
    onDragStart: (event: any) => {
      refDrag.current = true;
      //
      if (controlsRef.current) controlsRef.current.enabled = false;
    },
    onDragEnd: (event: any) => {
      if (controlsRef.current) controlsRef.current.enabled = true;
      //
      refDrag.current = false;
      //
      const nextPosition = event.eventObject.position
        .toArray()
        .map((coord: number) => coord.toFixed(3));
      //
      const coordsFromPosition = (arr: Array<string>) => {
        const [x, y, z] = arr.map(parseFloat);
        //
        //
        const lat = ((z * 90) / 5) * -2; // vertical (from z)
        const lng = (x * 180) / 5; // horizontal (from x)
        // @47.3191809,19.1271184,
        return [lat, lng] as [number, number];
      };
      //
      const nextCoords = coordsFromPosition(nextPosition);
      //
      refDynamicText.current = nextCoords
        ? `${nextCoords[0].toFixed(3)}, ${nextCoords[1].toFixed(3)}}`
        : "";
      //
      setBoxGeoPosition(nextCoords);
    },
  };

  const countriesFromPosition = useMemo(() => {
    if (!countries) return [];
    if (!boxGeoPosition) return countries.map((c) => ({ ...c, distance: 0 }));
    //
    // calculate position from selection
    //
    const [lat, lng] = boxGeoPosition;
    //
    const diffs = countries.map(
      (c) =>
        [c, distanceFromCoords(c, { x: lng, y: lat })] as [WikiCountry, number]
    );
    //
    const countriesWithDistance = countries
      .map((c, i) => ({
        ...c,
        distance: diffs[i][1],
      }))
      .sort((a, b) => a.distance - b.distance);
    //
    return countriesWithDistance;
  }, [boxGeoPosition, countries]);
  //
  const boxesMemo = useMemo(
    () => (
      <group scale={[10 / 36, 1, 10 / 36]} position={[0, -0.12, 0]}>
        <Boxes i={36} j={18} baseColor={new Color(1, 1, 1)} />
      </group>
    ),
    []
  );
  //
  const LAST_IDX = 5;
  const renderCountry = (c: WikiCountry, idx: number) => (
    <span key={`${c.code}_${idx}`}>
      {availableCountryCodes.includes(c.code) ? (
        <a href={`map/${c.code}`} title={c.name}>
          <b key={c.code} style={{ color: "gold" }}>
            {c.name}
          </b>
        </a>
      ) : (
        <small>{c.name}</small>
      )}
      {idx < LAST_IDX ? " - " : ""}
    </span>
  );
  //
  return (
    <>
      <div>
        {countriesFromPosition[0] ? (
          <>
            Nearest is {renderCountry(countriesFromPosition[0], LAST_IDX)},{" "}
            {countriesFromPosition[0]?.distance.toFixed(2)} km away.
          </>
        ) : null}
        <br />
        Nearby:{" "}
        {countriesFromPosition
          ? countriesFromPosition.slice(1, 1 + LAST_IDX + 1).map(renderCountry)
          : null}
      </div>
      <Suspense
        fallback={
          <div style={{ width: "100%", height: "100%" }}>
            <b style={{ margin: "auto" }}>Loading...</b>
            <Spinner />
          </div>
        }
      >
        <Canvas
          shadows={isShadowEnabled}
          camera={{
            far: 5000,
            fov: 50,
            position: [0.16, 0.22, 0.55],
            aspect: 16 / 9,
          }}
        >
          <MovingSpotLight castShadow={isShadowEnabled} />
          <hemisphereLight intensity={0.1} />

          <OrbitControls
            ref={controlsRef}
            enableZoom={true}
            autoRotate
            autoRotateSpeed={0.2}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2.5}
            maxDistance={8}
            makeDefault
          />

          <Bounds fit clip observe damping={0.6} margin={5.19}>
            <group position={[0, 0.05, 0]}>
              <Draggable {...dragProps}>
                <Billboard>
                  <Text fontSize={0.01} position={[0, 0.051, 0]}>
                    Drag me!
                  </Text>
                  <Text fontSize={0.00521} position={[0, 0.041, 0]}>
                    {refDynamicText.current}
                  </Text>
                </Billboard>
                <mesh castShadow>
                  <boxGeometry args={[0.051, 0.051, 0.051]} />
                  <meshLambertMaterial color={"pink"} />
                </mesh>
              </Draggable>
            </group>
          </Bounds>

          <MyText
            castShadow
            receiveShadow
            position={[0, 0.13, -2.8]}
            fontSize={0.5}
            bevelSize={0.2}
            fontColor={"#afafff"}
          >
            Welcome to Reactive 3D!
          </MyText>

          <Sky
            distance={450000}
            sunPosition={[0, 3, 0]}
            inclination={0}
            azimuth={0.25}
          />
          <group rotation={[-Math.PI / 2, 0, 0]}>
            <mesh receiveShadow>
              <planeBufferGeometry args={[120, 60, 10, 10]} />
              <meshLambertMaterial color={"#205cab"} />
            </mesh>

            {/* <SeaLevel width={10} segments={10} /> */}
            <ShaderPlaneMesh />
          </group>

          {showGrid && (
            <GridFloor
              i={36 * 3}
              j={18 * 3}
              setHeightViewPort={() => {}}
              position={[0, -0.0111, 0]}
              scale={[10 / (36 * 3), 1 / (2 * 3), 10 / (36 * 3)]}
              sampling={1200}
            />
          )}

          {boxesMemo}
        </Canvas>
      </Suspense>
    </>
  );
};

export default AppHome3D;
