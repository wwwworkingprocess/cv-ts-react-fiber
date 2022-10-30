import { useState, useRef, useMemo } from "react";
import type { NavigateFunction } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
//
// THREE.JS
//
import {
  Billboard,
  MapControls,
  OrthographicCamera,
  Stats,
  Text,
} from "@react-three/drei";
import Camera from "../Camera";
import { Color, Vector3Tuple } from "three";
//
// FIBERS
//
import CountryBorder from "./fibers/country/country-border";
import CountryBorderLine from "./fibers/country/country-border-line";
import CountryAdminOneFeatures from "./fibers/admin-one/country-admin-one-features";
import CountryCityFeatures from "./fibers/city/country-city-features";
//
// HOOKS
//
import { useColorPalette } from "./hooks/useColorPalette";
import { useAdminOneGeoData } from "./hooks/useAdminOneGeoData";
import { useTreeDataForCountry } from "./hooks/useTreeDataForCountry";
//
// DATA
//
import palettes from "./palettes.json";
import hungarianBorder from "./border.28.json";

const HungaryApp3D = (props: {
  navigate: NavigateFunction;
  path?: string;
  minPop?: number;
  maxPop: number;
  themeId: number; //[0..100]
}) => {
  const { path, minPop, maxPop, themeId } = props;
  //
  const isOrtographic = false;
  const { currentColors: adminOneColors } = useColorPalette(themeId);
  const countryBorderPoints = hungarianBorder.coordinates as Array<
    [number, number]
  >;
  //
  //const [countryCode /*, setCountryCode*/] = useState<string>("28");
  const [countryCode /*, setCountryCode*/] = useState<string>("Q28");
  // const [selectedCode, setSelectedCode] = useState<string>("Q28");
  //

  //
  const { loading, tree, /* keys, nodes,*/ cMemo } = useTreeDataForCountry(
    countryCode,
    minPop,
    maxPop,
    path
  );
  //

  const [perspectiveTarget /*, setPerspectiveTarget*/] = useState<Vector3Tuple>(
    [0, 1, 1]
  );
  const [perspectivePosition /*, setPerspectivePosition*/] =
    useState<Vector3Tuple>([0, 0, 3]);

  const controlledCameraPropsMemo = useMemo(() => {
    const controlledCameraProps = {
      perspectivePosition: perspectivePosition,
      perspectiveTarget: perspectiveTarget,
      orthographicPosition: [0, 0, 0],
      orthographicTarget: [0, 0, 0],
    } as {
      perspectivePosition: Vector3Tuple | undefined;
      perspectiveTarget: Vector3Tuple | undefined;
      orthographicPosition: Vector3Tuple | undefined;
      orthographicTarget: Vector3Tuple | undefined;
    };
    //
    return controlledCameraProps;
  }, [perspectiveTarget, perspectivePosition]);
  //
  const controls = useRef(null);
  const camera = useRef();

  const { features: featuresA1 } = useAdminOneGeoData(countryCode, path);

  const parentsMemo = useMemo(() => {
    if (loading) return [] as Array<number>;
    if (tree) {
      const all = tree.list_all();
      const parents = all.map((x) => Number(x.p) || 3);
      //
      return Array.from(new Set(parents));
    }
  }, [loading, tree]);

  const parentColorMemo = useMemo(() => {
    if (parentsMemo) {
      const colorRange = palettes.flat();
      //
      return Object.fromEntries(
        parentsMemo.map((i: any) => [
          String(i),
          new Color(colorRange[i % parentsMemo.length]),
        ])
      ) as Record<string, Color>;
    }
    return {} as Record<string, Color>;
  }, [parentsMemo]);

  const canvasRef = useRef<HTMLCanvasElement>(null!);
  return (
    <>
      <Canvas ref={canvasRef} shadows dpr={[1, 2]}>
        {canvasRef ? <Stats showPanel={0} parent={canvasRef} /> : null}

        <pointLight position={[-10, -10, -10]} />
        <spotLight intensity={8} angle={Math.PI / 10} position={[10, 10, 10]} />

        {!isOrtographic ? (
          <Camera {...controlledCameraPropsMemo} />
        ) : (
          <>
            <MapControls
              ref={controls}
              screenSpacePanning
              dampingFactor={1}
              enableRotate={false}
            />
            <OrthographicCamera
              ref={camera}
              makeDefault
              position={[0, 0, 1]}
              zoom={40}
            />
          </>
        )}

        <group position={[-19, -46, 0]}>
          {cMemo && parentColorMemo ? (
            <CountryCityFeatures
              range={cMemo.length}
              treeNodes={cMemo}
              parentColors={parentColorMemo}
            />
          ) : (
            <></>
          )}

          <CountryBorder countryBorderPoints={countryBorderPoints} />
          <CountryBorderLine countryBorderPoints={countryBorderPoints} />

          {featuresA1 ? (
            <CountryAdminOneFeatures
              featuresA1={featuresA1}
              colors={adminOneColors}
            />
          ) : null}
        </group>

        <Billboard position={[0, -1, 0]} follow={true}>
          <Text fontSize={1}>{cMemo?.length}</Text>
        </Billboard>

        {/* <gridHelper rotation={[Math.PI / 2, 0, 0]} /> */}
      </Canvas>
    </>
  );
};

export default HungaryApp3D;
