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
      <Billboard
        // position={hasInput ? [0, 0, 0] : [0, 0, 0]}
        follow={true}
        visible={hasInput}
      >
        {!hasInput && (
          <Text fontSize={1} fillOpacity={hadInput ? 0.3 : 1}>
            {hadInput ? "Loading..." : ""}
          </Text>
        )}
        {hasInput && rawWikiJson && (
          <>
            <Text fontSize={1} position={[0, -1.5, 0]} fillOpacity={0.4}>
              {rawWikiJson.description.en}
            </Text>
            <Text fontSize={0.4} position={[0, -2.2, 0]} fillOpacity={0.33}>
              {firstFeatureCoordinates.length > 1 &&
                `${firstFeatureCoordinates.length} features`}
            </Text>
          </>
        )}
      </Billboard>
    </group>
  );
};

export default PlacedCountryBillboard;
