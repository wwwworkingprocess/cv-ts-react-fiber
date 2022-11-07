import { useMemo, useRef, useState } from "react";

import { ThreeEvent } from "@react-three/fiber";
import {
  Color,
  DoubleSide,
  Euler,
  Group,
  MeshPhongMaterial,
  Vector3,
} from "three";

import useGameAppStore from "../stores/useGameAppStore";
import useWikiGeoJson from "../../../hooks/wiki/useWikiGeoJson";
import CountryBorder from "./country-border";

const COLOR_WHITE = new Color("white");
//
const SelectedFeature = (
  props: JSX.IntrinsicElements["group"]
  // & {
  //   points: Array<[number, number]> | null;
  //   color?: Color;
  // }
) => {
  const groupShiftBeforeRotation = new Vector3(0, 0, -1 + 0.15);
  const groupToStageRotation = new Euler(-Math.PI / 2, 0, 0);
  //
  const ref = useRef<Group>(null!);
  const materialRef = useRef<MeshPhongMaterial>(null!);
  const [hovered, setHover] = useState(false);
  //
  const lastTakenPlaceGeoJsonUrl = useGameAppStore(
    (s) => s.lastFeature.geoJsonUrl
  );
  //
  //
  //
  const rawWikiJson = useWikiGeoJson(lastTakenPlaceGeoJsonUrl);
  const coords = useMemo(
    () =>
      rawWikiJson
        ? rawWikiJson.data.features?.[0].geometry.coordinates ?? []
        : [],
    [rawWikiJson]
  );

  //
  // handling 'hover'
  //
  const onPointerOut = (e: ThreeEvent<PointerEvent>) => setHover(false);
  const onPointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHover(true);
  };

  //
  //
  //
  const renderShape = (
    coords: Array<[number, number]>,
    idx: number,
    color: string
  ) => {
    const color3d = new Color(color);
    //
    const isNested = coords[0].length !== 2;
    const points = (isNested ? coords[0] : coords) as Array<[number, number]>;
    //
    return (
      <CountryBorder
        key={idx}
        points={points}
        color={color3d}
        position={[0, 0, 0]}
      />
    );
  };

  //
  // Only rerender feature, when coordinates are changing
  //
  const memoizedFeatures = useMemo(
    () =>
      coords && (
        <>
          {coords.map((v: Array<[number, number]>, i: number) =>
            renderShape(v, i, "orange")
          )}
        </>
      ),
    [coords]
  );

  //
  return (
    <group scale={[1, 1, 1]}>
      <group rotation={groupToStageRotation}>
        <group
          ref={ref}
          position={groupShiftBeforeRotation}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
          {...props}
          scale={[1, 2, 1]}
        >
          {memoizedFeatures}

          <meshBasicMaterial
            ref={materialRef}
            side={DoubleSide}
            color={COLOR_WHITE}
          />
        </group>
      </group>
    </group>
  );
};

export default SelectedFeature;
