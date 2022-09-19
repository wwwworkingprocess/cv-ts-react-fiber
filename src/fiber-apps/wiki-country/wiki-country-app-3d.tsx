import { useEffect, useMemo, useState } from "react";
import type { NavigateFunction } from "react-router-dom";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import PlacedCountryShape from "./fibers/placed-country-shape";
import PlacedCountryBillboard from "./fibers/placed-country-billboard";
import { Color } from "three";

const WikiCountryApp3D = (props: {
  navigate: NavigateFunction;
  path?: string;
  applicationProps?: {
    capital: Record<string, any>;
    geo: Record<string, any>;
  };
  isFullscreenEnabled: boolean;
}) => {
  const { applicationProps, isFullscreenEnabled } = props;
  //
  const capital = applicationProps ? applicationProps.capital : undefined;
  const rawWikiJson = applicationProps ? applicationProps.geo : undefined;
  //
  const hasInput = rawWikiJson !== undefined;
  const [hadInput, setHadInput] = useState<boolean>(false);
  useEffect(() => {
    if (hasInput) setHadInput(true);
    //
    return () => {}; // no cleanup for effect
  }, [hasInput]);
  //
  const [showGroupBounds, setShowGroupBounds] = useState<boolean>(true);
  const [showFeatureBounds, setShowFeatureBounds] = useState<boolean>(true);
  //

  //
  //
  //
  const firstFeatureCoordinates = useMemo(() => {
    if (rawWikiJson) {
      const arrs = rawWikiJson.data.features[0].geometry.coordinates;
      return arrs; //
    } else return [];
  }, [rawWikiJson]);

  //
  //
  //

  const capitalMemo = useMemo(
    () =>
      capital
        ? {
            name: capital.name,
            lat: capital.lat,
            lng: capital.lng,
            population: capital.population,
            color: new Color(Math.random(), Math.random(), Math.random()),
          }
        : undefined,
    [capital]
  );

  //
  return (
    <div
      style={{
        height: isFullscreenEnabled
          ? "calc(100vh - 200px)"
          : "calc(100vh - 400px)",
      }}
    >
      <div style={{ position: "absolute", zIndex: 1 }}>
        Bounds:{" "}
        <input
          type="checkbox"
          checked={showGroupBounds}
          onChange={() => setShowGroupBounds(!showGroupBounds)}
        />{" "}
        Feature bounds:{" "}
        <input
          type="checkbox"
          checked={showFeatureBounds}
          onChange={() => setShowFeatureBounds(!showFeatureBounds)}
        />
      </div>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 10, 0.1] }}>
        <OrbitControls />

        <ambientLight intensity={0.3} />
        <spotLight position={[10, 20, 10]} angle={0.25} penumbra={1} />
        <pointLight position={[-10, -4, -10]} decay={0.44} power={3} />

        <PlacedCountryBillboard
          hasInput={hasInput}
          hadInput={hadInput}
          rawWikiJson={rawWikiJson}
          firstFeatureCoordinates={firstFeatureCoordinates}
        />

        <PlacedCountryShape
          showGroupBounds={showGroupBounds}
          showFeatureBounds={showFeatureBounds}
          firstFeatureCoordinates={firstFeatureCoordinates}
          capital={capitalMemo}
        />
      </Canvas>
    </div>
  );
};

export default WikiCountryApp3D;
