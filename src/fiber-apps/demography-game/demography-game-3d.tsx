import { isMobile } from "react-device-detect";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, Bounds, OrbitControls, Text } from "@react-three/drei";

import useKeyboardNavigation from "./hooks/useKeyboardNavigation";

import Floor from "./fibers/floor";
import Player from "./fibers/player";
import FrameCounter from "./fibers/frame-counter";
import DefaultLightRig from "../DefaultLightRig";

import { ControlsContainer } from "./demography-game-3d.styles";
import AxisValueInput from "./components/axis-value-input";

import useGameAppStore from "./stores/useGameAppStore";
import useAppController from "./hooks/useAppController";
import { WikiCountry } from "../../utils/firebase/repo/wiki-country.types";
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Spinner } from "../../components/spinner/spinner.component";
import { Mesh, Vector3 } from "three";
import TreeHelper from "../../utils/tree-helper";
import { distance } from "../../utils/geo";

const City = ({
  data,
  zoomToView,
  setSelectedCode,
}: {
  data: any;
  zoomToView: any;
  setSelectedCode: any;
}) => {
  const meshRef = useRef<Mesh>(null!);

  const [hover, setHover] = useState(false);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hover ? "pointer" : "default";
  }, [hover]);

  useLayoutEffect(() => {
    meshRef.current.position.x = data.position[0];
    meshRef.current.position.y = data.position[1];
    meshRef.current.position.z = data.position[2];
  });
  //
  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      onPointerDown={() => {
        setClicked(!clicked);
        zoomToView(meshRef);
        console.log(meshRef.current.position);
        setSelectedCode(`Q${data.code}`);
      }}
      scale={[1 / 4, 1 / 4, 1 / 4]}
    >
      {clicked && (
        <Billboard position={[0, 0.035, 0]} follow={true}>
          <Text fontSize={0.13} color={"#ffaa22"}>
            {/* Use arrow keys for navigation */}
            {data.name}
          </Text>
        </Billboard>
      )}
      {/* <boxBufferGeometry attach="geometry" args={[0.1, 0.08, 0.003]} /> */}
      <boxBufferGeometry attach="geometry" args={[0.08, 0.03, 0.08]} />
      <meshStandardMaterial color={hover ? "white" : data.color} />
    </mesh>
  );
};

const Cities = ({
  momentsData,
  zoom,
  setZoom,
  focus,
  setFocus,
  //
  zoomToView,
  setSelectedCode,
}: {
  momentsData: any;
  zoom: any;
  setZoom: any;
  focus: any;
  setFocus: any;
  //
  zoomToView: (focusRef: React.MutableRefObject<Mesh>) => void;
  setSelectedCode: React.Dispatch<string | undefined>;
}) => {
  const vDef = [-21 + 1, 0 + 50, 40 - 0.65 + 1];
  const vDef2 = [-20.5 + 1, 0 + 0.1, 47.5 - 0.65 + 0];
  //
  const crosshairMesh = useRef<Mesh>(null!);
  const positionVec = new Vector3();
  const lookatVec = new Vector3();
  //
  useFrame((state) => {
    const step = 0.01;
    // const step = 0.05;

    zoom
      ? positionVec.set(focus.x, focus.y, focus.z + 0.01)
      : positionVec.set(vDef[0], vDef[1], vDef[2]);
    zoom
      ? lookatVec.set(focus.x, focus.y, focus.z - 0.01)
      : lookatVec.set(vDef2[0], vDef2[1], vDef2[2]);
    //
    state.camera.position.lerp(positionVec, step);
    crosshairMesh.current.position.lerp(lookatVec, step);
    //
    const cp = crosshairMesh.current.position;
    //
    state.camera.lookAt(cp.x, cp.y, cp.z);
    crosshairMesh.current.updateMatrix();
    state.camera.updateProjectionMatrix();
    //
    //
    if (zoom) {
      if (state.camera.zoom < 100) state.camera.zoom += 0.1;
    } else {
      if (state.camera.zoom > 25) state.camera.zoom -= 0.2;
    }
  });

  console.log("rendering ", momentsData.length, "cities");
  //
  return (
    <instancedMesh>
      {momentsData.map((node: any, i: number) => {
        // Set position here so it isn't reset on state change
        // for individual city
        return (
          <City
            key={i}
            data={node}
            zoomToView={zoomToView}
            setSelectedCode={setSelectedCode}
          />
        );
      })}
      <mesh ref={crosshairMesh} position={[-15, 0, 45]}>
        <boxBufferGeometry attach="geometry" args={[0.1, 0.08, 0.003]} />
        <meshStandardMaterial wireframe color="white" />
      </mesh>
    </instancedMesh>
  );
};

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

  const cities = useMemo(() => {
    const nodes = tree.list_all().slice(143); // skip continents and countries except hungary
    let filtered;
    //
    if (!selectedCode) {
      //
      // showing max 300 cities, sort by population
      //
      filtered = nodes
        .filter((n) => n.data?.pop || -2)
        .sort((na, nb) => (nb.data?.pop || -2) - (na.data?.pop || -2))
        .slice(0, 300);
      //
    } else {
      //
      // showing max 500 cities, sort by proximity
      //
      const selectedNode = tree._n(selectedCode);
      const data = selectedNode ? selectedNode.data : {};
      const { lat, lng } = data;
      //
      const range = 50;
      //
      filtered = nodes
        .filter((n) => !n.data || n.data.lat || n.data.lng)
        .map((n) => ({
          ...n,
          distance: distance([lat, lng], [n.data?.lat ?? 0, n.data?.lng ?? 0]),
        }))
        .filter((n) => n.distance * 10e-4 <= range)
        .sort((a, b) => a.distance - b.distance);
    }
    //
    // code, name, position
    //
    const toItem = (node: any) => ({
      code: node.code,
      name: node.name,
      position: [-1 * node.data?.lng, -1 + 0.06, node.data?.lat],
      color: selectedCode === `Q${node.code}` ? "blue" : "red",
    });

    //
    return filtered.map(toItem);
  }, [tree, selectedCode]);
  //
  console.log("cities", cities.length, cities[0]);
  console.log(
    "cities rnd",
    cities.length,
    cities[Math.floor(Math.random() * 100)]
  );
  //
  //
  //

  const [zoom, setZoom] = useState<boolean>();
  const [focus, setFocus] = useState(new Vector3(-17, 0 + 1, 45 + 1));
  //
  //
  //
  const zoomToView = (focusRef?: React.MutableRefObject<Mesh>) => {
    if (focusRef) {
      setZoom(true);
      // setZoom(!zoom);
      // setZoom(focusRef.current !== undefined);
      setFocus(focusRef.current.position);
    } else {
      setZoom(false);
      setSelectedCode(undefined);
    }
  };

  const zoomToViewByCode = useCallback(
    (code: string | undefined) => {
      const numericCode = parseInt((code || "").replace("Q", ""));
      const node = cities.filter((c) => c.code === numericCode)[0];
      //
      if (node) {
        const { code, name, position } = node;
        //
        console.log("zooming to node", code, name);
        //
        setZoom(true);
        setFocus(new Vector3(position[0], position[1], position[2]));
      }
    },
    [cities]
  );

  useEffect(() => {
    if (selectedCode) {
      zoomToViewByCode(selectedCode);
    } else {
      zoomToView(undefined);
    }
    //
    // no cleanup
  }, [selectedCode, zoomToViewByCode]);

  const memoizedCities = useMemo(
    () => (
      <Cities
        momentsData={cities}
        zoom={zoom}
        setZoom={setZoom}
        focus={focus}
        setFocus={setFocus}
        zoomToView={zoomToView}
        //
        setSelectedCode={setSelectedCode}
      />
    ),
    [cities, zoom, focus, setSelectedCode]
  );
  //
  //
  //

  return (
    <>
      <Suspense fallback={<Spinner />}>
        <Canvas
          style={{ height: "350px" }}
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
      <ControlsContainer>
        {zoom && (
          <button onClick={(e) => focus && zoomToView(undefined)}>
            Zoom out
          </button>
        )}
        {!zoom && (
          <button onClick={(e) => focus && zoomToViewByCode(selectedCode)}>
            Zoom In
          </button>
        )}

        <AxisValueInput axis={"x"} min={MIN_X} max={MAX_X} />
        {/* <AxisValueInput axis={"y"} min={0} max={10} /> */}
        <AxisValueInput axis={"z"} min={MIN_Y} max={MAX_Y} />
        {isMobile ? <button onClick={onJump}>Jump</button> : undefined}
      </ControlsContainer>
    </>
  );
};

export default DemographyGame3D;
