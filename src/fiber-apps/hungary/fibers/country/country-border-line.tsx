import { Line } from "@react-three/drei";

const CountryBorderLine = (
  props: JSX.IntrinsicElements["line"] & {
    countryBorderPoints: Array<[number, number]> | null;
  }
) => {
  const { countryBorderPoints } = props;
  //
  return countryBorderPoints ? (
    <Line
      points={countryBorderPoints.map(
        (xy) => [xy[0], xy[1], -0.5] as [number, number, number]
      )} // Array of points
      color={0} // Default
      lineWidth={1} // In pixels (default)
      dashed={false} // Default
      vertexColors={[
        [0, 250, 0],
        [60, 60, 60],
      ]} // Optional array of RGB values for each point
      // {...lineProps}                  // All THREE.Line2 props are valid
      // {...materialProps}              // All THREE.LineMaterial props are valid
    />
  ) : null;
};

export default CountryBorderLine;
