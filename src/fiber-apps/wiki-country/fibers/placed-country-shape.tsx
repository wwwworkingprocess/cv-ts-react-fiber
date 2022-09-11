import { Billboard, Bounds, Center, Text, useHelper } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { BoxHelper, Color, Group, Vector3 } from "three";
import CountryBorder from "./country-border";

const PlacedCountryShape = (
  props: JSX.IntrinsicElements["group"] & {
    firstFeatureCoordinates: Array<any>;
    //
    showGroupBounds: boolean;
    showFeatureBounds: boolean;
    //
    capital?: {
      name: string;
      population: number;
      lat: number;
      lng: number;
      color: Color;
    };
  }
) => {
  const {
    firstFeatureCoordinates,
    showGroupBounds,
    showFeatureBounds,
    capital,
  } = props;
  //
  const groupToStageRotation = [-Math.PI / 2, 0, 0];
  //
  const groupRef = useRef<Group>(null!);
  const capitalRef = useRef<Group>(null!);
  //
  useHelper(showGroupBounds ? groupRef : undefined, BoxHelper, "red");
  //
  const capitalCoords = useMemo(
    () => (capital ? new Vector3(capital.lng, capital.lat, 0) : undefined),
    [capital]
  );
  //
  return (
    <group>
      {/* <gridHelper /> */}
      <Bounds fit clip observe damping={6} margin={0.9}>
        <group
          rotation={groupToStageRotation as any}
          visible={capital !== undefined}
        >
          <Center>
            <group ref={capitalRef}>
              <group position={capitalCoords}>
                <group position={[0, 0, 0.5]}>
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <boxGeometry args={[0.01, 1, 0.01]} />
                    <meshStandardMaterial color="white" />
                    <group position={[0, 1.0, 0]}>
                      {capital ? (
                        <Billboard>
                          <Text fontSize={0.5} fillOpacity={0.8}>
                            {capital.name}
                          </Text>
                          <Text
                            fontSize={0.25}
                            fillOpacity={0.8}
                            position={[0, -0.38, 0]}
                          >
                            {`${(capital.population * 10e-7).toFixed(2)}M`}
                          </Text>
                        </Billboard>
                      ) : undefined}
                    </group>
                  </mesh>
                </group>
              </group>
            </group>

            <group ref={groupRef}>
              {firstFeatureCoordinates && (
                <>
                  {firstFeatureCoordinates.map(
                    (coords: Array<[number, number]>, idx: number) => {
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
                            new Color(
                              Math.random(),
                              Math.random(),
                              Math.random()
                            )
                          }
                          capitalRef={capitalRef}
                        />
                      );
                    }
                  )}
                </>
              )}
            </group>
          </Center>
        </group>
      </Bounds>
    </group>
  );
};

export default PlacedCountryShape;
