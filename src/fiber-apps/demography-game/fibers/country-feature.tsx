import { useRef } from "react";

import { Color, Euler, Group, Vector3 } from "three";

import CountryBorder from "./country-border";

const CountryFeature = ({
  firstFeatureCoordinates,
  zoomToView,
}: {
  firstFeatureCoordinates: any;
  zoomToView: any;
}) => {
  const groupRef = useRef<Group>(null!);
  //
  const color = new Color("blue");
  const groupToStageRotation = new Euler(-Math.PI / 2, 0, 0);
  const groupShiftBeforeRotation = new Vector3(0, 0, -95); //TODO: country/bounds dependent
  //
  const renderShape = (coords: Array<[number, number]>, idx: number) => {
    const isNested = coords.length === 1;
    const points = (isNested ? coords[0] : coords) as Array<[number, number]>;
    //
    return (
      <CountryBorder key={idx} countryBorderPoints={points} color={color} />
    );
  };
  //
  return (
    <group position={[0, 0, 0]} scale={[1, 0.01, 1]}>
      <group rotation={groupToStageRotation}>
        <group ref={groupRef} position={groupShiftBeforeRotation}>
          {firstFeatureCoordinates && (
            <>{firstFeatureCoordinates.map(renderShape)}</>
          )}
        </group>
      </group>
    </group>
  );
};

export default CountryFeature;
