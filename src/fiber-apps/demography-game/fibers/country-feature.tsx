import { useMemo, useRef } from "react";

import { Color, Euler, Group, Vector3 } from "three";

import CountryBorder from "./country-border";

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
  return <CountryBorder key={idx} points={points} color={color3d} />;
};

const CountryFeature = ({ coords, color }: { coords: any; color: string }) => {
  const groupRef = useRef<Group>(null!);
  //
  const groupToStageRotation = new Euler(-Math.PI / 2, 0, 0);
  const groupShiftBeforeRotation = new Vector3(0, 0, -1 + 0.05);

  //
  // Only rerender feature, when coordinates or color is changing
  //
  const memoizedFeatures = useMemo(
    () =>
      coords && (
        <>
          {coords.map((v: Array<[number, number]>, i: number) =>
            renderShape(v, i, color)
          )}
        </>
      ),
    [coords, color]
  );

  //
  return (
    <group scale={[1, 1, 1]}>
      <group rotation={groupToStageRotation}>
        <group
          ref={groupRef}
          position={groupShiftBeforeRotation}
          scale={[1, 2, 1]}
        >
          {memoizedFeatures}
        </group>
      </group>
    </group>
  );
};

export default CountryFeature;
