import { Color } from "three";
import CountryAdminOneFeature from "./country-admin-one-feature";

const CountryAdminOneFeatures = (
  props: JSX.IntrinsicElements["group"] & {
    colors: Array<string>;
    featuresA1: Array<{ properties: any; geometry: any }> | null;
  }
) => {
  const { featuresA1, colors } = props;
  //
  return (
    <group {...props}>
      {featuresA1?.map((f, idx) => {
        const { id } = f.properties;
        const { coordinates } = f.geometry;
        //
        const coords = coordinates[0]; // inner ring
        //const coordsOutter = coordinates[1] || []; // outter ring
        //
        return (
          <CountryAdminOneFeature
            key={id}
            coords={coords}
            color={new Color(colors[idx % colors.length])}
            position={[0, 0, 0.01 + 0.002 * idx]}
          />
        );
      })}
    </group>
  );
};

export default CountryAdminOneFeatures;
