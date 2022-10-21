import { useMemo, useRef } from "react";

import { Mesh, Vector3 } from "three";

import useGameAppStore from "../stores/useGameAppStore";
import useMapAutoPanningAnimation from "../hooks/useMapAutoPanningAnimation";

import CityFeature from "./city-feature";
import CrossHair from "./cross-hair";

type CityFeaturesOwnProps = {
  cities: any;
  focus: Vector3;
  extra: boolean;
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
    extra,
    //
    zoomToView,
    ...instancedMeshProps
  } = props;
  const crosshairMesh = useRef<Mesh>(null!);
  //
  const crosshairStartPosition = useMemo(() => new Vector3(-15, 0.01, 45), []); // bounds/country dependent default
  //
  const zoom = useGameAppStore((state) => state.zoom);
  //
  //
  useMapAutoPanningAnimation(crosshairMesh, zoom, extra, focus);

  //
  //
  //
  return (
    <instancedMesh {...instancedMeshProps}>
      {cities.map((node: any, i: number) => (
        <CityFeature
          key={`${node.code}_${node.isSelected}`}
          data={node}
          zoom={zoom}
          zoomToView={zoomToView}
        />
      ))}
      <CrossHair
        focus={focus}
        crosshairMesh={crosshairMesh}
        crosshairStartPosition={crosshairStartPosition}
      />
    </instancedMesh>
  );
};

export default CityFeatures;
