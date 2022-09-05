import { useEffect, useMemo, useState } from "react";
import type { NavigateFunction } from "react-router-dom";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import PlacedCountryShape from "./fibers/placed-country-shape";
import PlacedCountryBillboard from "./fibers/placed-country-billboard";

const WikiCountryApp3D = (props: {
  navigate: NavigateFunction;
  path?: string;
  rawWikiJson?: Record<string, any>;
}) => {
  const { rawWikiJson } = props;
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
  // TODO: flatmap all the features, instead of
  // using the 'first features coordinates'
  //
  const firstFeatureCoordinates = useMemo(() => {
    if (rawWikiJson) {
      const arrs = rawWikiJson.data.features[0].geometry.coordinates;
      return arrs; //
    } else return [];
  }, [rawWikiJson]);
  //
  const rawFeatureCount = useMemo(
    () =>
      rawWikiJson
        ? rawWikiJson.data.features[0].geometry.coordinates.length
        : 0,
    [rawWikiJson]
  );

  return (
    <>
      <div>
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
        Features: {rawFeatureCount}
      </div>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 10, 0.1] }}>
        <OrbitControls />

        <spotLight position={[10, 20, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />

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
        />
      </Canvas>
    </>
  );
};

export default WikiCountryApp3D;
