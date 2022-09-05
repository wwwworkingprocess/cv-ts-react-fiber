import { Bounds, Center, useHelper } from "@react-three/drei";
import { useRef } from "react";
import { BoxHelper, Color, Group } from "three";
import CountryBorder from "./country-border";

const PlacedCountryShape = (
  props: JSX.IntrinsicElements["group"] & {
    firstFeatureCoordinates: Array<any>;
    showGroupBounds: boolean;
    showFeatureBounds: boolean;
  }
) => {
  const { firstFeatureCoordinates, showGroupBounds, showFeatureBounds } = props;
  //
  const groupToStageRotation = [-Math.PI / 2, 0, 0];
  //
  const groupRef = useRef<Group>(null!);
  useHelper(showGroupBounds ? groupRef : undefined, BoxHelper, "red");
  //
  //
  //
  return (
    <group>
      <gridHelper />
      <Bounds
        fit
        clip
        observe
        damping={6}
        margin={0.9}
        onFit={(e) => console.log("transition finished", e)}
      >
        <group rotation={groupToStageRotation as any} ref={groupRef}>
          <Center>
            {firstFeatureCoordinates &&
              firstFeatureCoordinates.map(
                (coords: Array<[number, number]>, idx: number) => {
                  // console.log( "rendering coord arr", idx, coords.length, "points" );
                  //
                  const isNested = coords.length === 1;
                  const points = (isNested ? coords[0] : coords) as Array<
                    [number, number]
                  >;

                  //
                  return (
                    <CountryBorder
                      key={idx}
                      countryBorderPoints={points}
                      showFeatureBounds={showFeatureBounds}
                      color={
                        new Color(Math.random(), Math.random(), Math.random())
                      }
                    />
                  );
                }
              )}
          </Center>
        </group>
      </Bounds>
    </group>
  );
};

export default PlacedCountryShape;
