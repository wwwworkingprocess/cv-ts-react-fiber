import { useRef } from "react";

import { Mesh, Vector3 } from "three";

import useGameAppStore from "../stores/useGameAppStore";
import useMapAutoPanningAnimation from "../hooks/useMapAutoPanningAnimation";

import CityFeature from "./city-feature";
import CrossHair from "./cross-hair";

type CityFeaturesOwnProps = {
  cities: any;
  focus: Vector3;
  start: Vector3;
  extraZoom: boolean;
  //
  defaultPanPosition: Vector3;
  defaultPanLookAt: Vector3;
  //
  zoomToView: (focusRef: React.MutableRefObject<Mesh>) => void;
};

const CityFeatures = (
  props: JSX.IntrinsicElements["instancedMesh"] & CityFeaturesOwnProps
) => {
  const {
    cities,
    focus,
    start,
    //
    extraZoom,
    defaultPanPosition,
    defaultPanLookAt,
    //
    zoomToView,
    ...instancedMeshProps
  } = props;
  const crosshairRef = useRef<Mesh>(null!);
  //
  const zoom = useGameAppStore((s) => s.zoom);
  //
  useMapAutoPanningAnimation(
    crosshairRef,
    zoom,
    extraZoom,
    focus,
    defaultPanPosition,
    defaultPanLookAt
  );
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
      <CrossHair mutableRef={crosshairRef} focus={focus} position={start} />
    </instancedMesh>
  );
};

export default CityFeatures;
