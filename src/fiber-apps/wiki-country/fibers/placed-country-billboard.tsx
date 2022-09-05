import { Billboard, Text } from "@react-three/drei";

const PlacedCountryBillboard = (
  props: JSX.IntrinsicElements["group"] & {
    hasInput: boolean;
    hadInput: boolean;
    rawWikiJson?: any;
    firstFeatureCoordinates: Array<any>;
  }
) => {
  const { hasInput, hadInput, rawWikiJson, firstFeatureCoordinates } = props;
  //
  return (
    <group>
      <Billboard position={hasInput ? [0, 0, -6] : [0, 0, 0]} follow={true}>
        {!hasInput && (
          <Text fontSize={1} fillOpacity={hadInput ? 0.3 : 1}>
            {hadInput ? "Loading..." : "Please select a country"}
          </Text>
        )}
        {hasInput && rawWikiJson && (
          <>
            <Text fontSize={1}>
              [{rawWikiJson.latitude.toFixed(2)},
              {rawWikiJson.longitude.toFixed(2)}]
            </Text>
            <Text fontSize={1} position={[0, 2, 0]}>
              {rawWikiJson.description.en}
            </Text>
            <Text fontSize={1} position={[0, 4, 0]}>
              {firstFeatureCoordinates.length}
            </Text>
          </>
        )}
      </Billboard>
    </group>
  );
};

export default PlacedCountryBillboard;
