import { useEffect, useRef, useState } from "react";

import { Mesh, Vector3 } from "three";

import CityFeature from "./city-feature";
import useMapAutoPanningAnimation from "../hooks/useMapAutoPanningAnimation";
import { useFrame } from "@react-three/fiber";
import useGameAppStore from "../stores/useGameAppStore";

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
  // const [isMoving, setIsMoving] = useState<boolean>(false);
  const moving = useGameAppStore((state) => state.moving);
  const setMoving = useGameAppStore((state) => state.setMoving);

  //
  useMapAutoPanningAnimation(crosshairMesh, zoom, focus);
  //
  useFrame((state) => {
    if (zoom) {
      const p1 = crosshairMesh.current.position.clone();
      const p2 = focus.clone();
      //
      const crosshairDistanceFromDestination = p2.sub(p1).length();
      const epsilon = 0.02;
      //
      const hasArrived = crosshairDistanceFromDestination < epsilon;
      //
      if (!hasArrived) {
        //
        //TODO: aggregate distance traveled here
        //
        // console.log(crosshairDistanceFromDestination);
      } else {
        if (moving) {
          setMoving(false);
          console.log("Arrived.");
        }
        //
      }
    }
    // else skip
  });

  //
  // temporary solution, until 'moving' can be set
  // via change of 'selectedCode' or 'focus' in store
  //
  useEffect(() => {
    if (!moving) {
      setMoving(true);
      console.log("Started moving towards.", focus);
    }
  }, [focus]);
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
      <mesh
        ref={crosshairMesh}
        position={[-15, 0.01, 45]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusBufferGeometry attach="geometry" args={[0.05, 0.0025, 8, 24]} />
        <meshStandardMaterial color="gold" />
      </mesh>
    </instancedMesh>
  );
};

export default CityFeatures;
