import { useMemo, useRef } from "react";

import { Mesh, Vector3 } from "three";

import useGameAppStore from "../stores/useGameAppStore";
import useMapAutoPanningAnimation from "../hooks/useMapAutoPanningAnimation";

import CityFeature from "./city-feature";
import CrossHair from "./cross-hair";

type CityFeaturesOwnProps = {
  cities: any;
  focus: Vector3;
  extraZoom: boolean;
  //
  zoomToView: (focusRef: React.MutableRefObject<Mesh>) => void;
};

const CityFeatures = (
  props: JSX.IntrinsicElements["instancedMesh"] & CityFeaturesOwnProps
) => {
  const {
    cities,
    focus,
    //
    extraZoom,
    //
    zoomToView,
    ...instancedMeshProps
  } = props;
  const crosshairRef = useRef<Mesh>(null!);
  //
  const crosshairStartPosition = useMemo(() => new Vector3(-15, 0.01, 45), []); // bounds/country dependent default
  //
  const zoom = useGameAppStore((state) => state.zoom);
  //
  useMapAutoPanningAnimation(crosshairRef, zoom, extraZoom, focus);
  //
  //
  //
  return (
    <instancedMesh {...instancedMeshProps}>
      {cities.map((node: any, i: number) => (
        <CityFeature
          key={`${node.code}_${node.isSelected}`}
          data={node}
          zoomToView={zoomToView}
        />
      ))}
      <CrossHair
        mutableRef={crosshairRef}
        focus={focus}
        position={crosshairStartPosition}
      />
    </instancedMesh>
  );
};

export default CityFeatures;
