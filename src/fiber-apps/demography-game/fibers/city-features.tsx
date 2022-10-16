import { useRef } from "react";

import { Mesh, Vector3 } from "three";

import CityFeature from "./city-feature";
import useMapAutoPanningAnimation from "../hooks/useMapAutoPanningAnimation";

type CityFeaturesOwnProps = {
  cities: any;
  //
  zoom: boolean;
  focus: Vector3;
  //
  setZoom: React.Dispatch<boolean>;
  setFocus: React.Dispatch<Vector3>;
  //
  zoomToView: (focusRef: React.MutableRefObject<Mesh>) => void;
  setSelectedCode: React.Dispatch<string | undefined>;
};

const CityFeatures = (
  props: JSX.IntrinsicElements["instancedMesh"] & CityFeaturesOwnProps
) => {
  const {
    cities,
    zoom,
    focus,
    setZoom,
    setFocus,
    //
    zoomToView,
    setSelectedCode,
    ...instancedMeshProps
  } = props;
  const crosshairMesh = useRef<Mesh>(null!);
  //
  //
  useMapAutoPanningAnimation(crosshairMesh, zoom, focus);
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
          setSelectedCode={setSelectedCode}
        />
      ))}
      <mesh ref={crosshairMesh} position={[-15, 0, 45]}>
        <boxBufferGeometry attach="geometry" args={[0.1, 0.08, 0.003]} />
        <meshStandardMaterial wireframe color="white" />
      </mesh>
    </instancedMesh>
  );
};

export default CityFeatures;
