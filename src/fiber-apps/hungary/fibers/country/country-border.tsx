import { DoubleSide } from "three";
import { shapeFromCoords } from "../../../../utils/d3d";

const CountryBorder = (
  props: JSX.IntrinsicElements["mesh"] & {
    countryBorderPoints: Array<[number, number]> | null;
  }
) => {
  const { countryBorderPoints } = props;
  //
  return countryBorderPoints ? (
    <mesh {...props}>
      <shapeGeometry args={[shapeFromCoords(countryBorderPoints)]} />
      <meshBasicMaterial color="red" side={DoubleSide} />
    </mesh>
  ) : null;
};

export default CountryBorder;
