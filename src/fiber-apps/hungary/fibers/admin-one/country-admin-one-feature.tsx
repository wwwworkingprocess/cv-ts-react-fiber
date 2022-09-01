import { Color, DoubleSide } from "three";
import { shapeFromCoords } from "../../../../utils/d3d";

const CountryAdminOneFeature = (
  props: JSX.IntrinsicElements["mesh"] & {
    coords: Array<[number, number]> | null;
    color: Color | undefined;
    // coordsOutter: Array<[number, number]> | null; // TODO
  }
) => {
  const { coords, color } = props;
  //
  return (
    <mesh {...props}>
      <shapeGeometry args={[shapeFromCoords(coords as any)]} />
      <meshBasicMaterial color={color} side={DoubleSide} />
    </mesh>
  );
};

export default CountryAdminOneFeature;
