import { useMemo, useRef } from "react";
import { Color, Euler, Group, Vector3 } from "three";
import CountryBorder from "../../demography-game/fibers/country-border";

const NearestCountry = (
  props: JSX.IntrinsicElements["group"] & {
    countryBorderPoints: any;
  }
) => {
  const { countryBorderPoints } = props;
  //
  const ref = useRef<Group>(null!);
  //
  // useFrame(({ clock }) => {
  //   if (ref.current) { }
  // });
  //
  const color = "orange";
  const s = 0.0278;
  const scale = new Vector3(1, -1, 1);
  const position = new Vector3(0, 0.0155, 0);
  const groupToStageScale = new Vector3(-1 * s, -1 * s, s);
  const groupToStageRotation = new Euler(-Math.PI / 2, 0, 0);
  //
  const renderShape = (coords: Array<[number, number]>, idx: number) => {
    const color3d = new Color(color);
    //
    const isNested = coords[0].length !== 2;
    const points = (isNested ? coords[0] : coords) as Array<[number, number]>;
    //
    return <CountryBorder key={idx} points={points} color={color3d} />;
  };
  //
  const memoizedShape = useMemo(
    () => (countryBorderPoints ? countryBorderPoints.map(renderShape) : null),
    [countryBorderPoints]
  );
  //
  return (
    <group ref={ref} position={position} scale={scale} {...props}>
      <group scale={groupToStageScale} rotation={groupToStageRotation}>
        {memoizedShape}
      </group>
    </group>
  );
};

export default NearestCountry;
