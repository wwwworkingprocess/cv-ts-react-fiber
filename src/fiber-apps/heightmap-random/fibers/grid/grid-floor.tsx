import { useEffect, useMemo, useState } from "react";

import { Color, Vector3 } from "three";

import GridCrossHair from "./grid-crosshair";
import GridFloorCells from "./grid-floor-cells";

const GridFloor = (
  props: JSX.IntrinsicElements["group"] & {
    i: number;
    j: number;
    idx?: number; // integer, z-depth
    setHeightViewPort: React.Dispatch<
      React.SetStateAction<[number, number, number, number] | undefined>
    >;
  }
) => {
  const { i, j, setHeightViewPort } = props;
  //
  const crossHairHeight = 0.75;
  const [crossHairPosition, setCrossHairPosition] = useState<Vector3>();

  const activeViewPort = useMemo(() => {
    const defaultViewport = [0, 0, 120, 120];
    //
    if (!crossHairPosition) return undefined;
    // return defaultViewport as [number, number, number, number];
    //
    // 1. transform  crosshair_pos => xz
    // 2. transform xz to viewport
    //
    console.log("activeViewPort, cp:", crossHairPosition);
    //
    const { x, z } = crossHairPosition;
    //
    const px = x + 4.5; // (5-0.5)
    const pz = 4.5 - z; // px and pz is in range [0..9]
    //
    //  console.log("activeViewPort, vp:", { x, z, px, pz });
    //
    const [pixelPerX, pixelPerZ] = [120, 120];
    //
    const newViewport = [
      px * pixelPerX,
      pz * pixelPerZ,
      (px + 1) * pixelPerX,
      (pz + 1) * pixelPerZ,
    ];

    console.log("activeViewPort, vp:", { px, pz }, newViewport);

    //
    return newViewport as [number, number, number, number];
  }, [crossHairPosition]);

  useEffect(() => {
    setHeightViewPort(activeViewPort);
  }, [activeViewPort, setHeightViewPort]);

  //
  return (
    <group {...props}>
      <GridCrossHair
        crossHairPosition={crossHairPosition}
        crossHairHeight={crossHairHeight}
      />

      <GridFloorCells
        i={i}
        j={j}
        baseColor={new Color(0.1, 0.4, 0.4)}
        setCrossHairPosition={setCrossHairPosition}
      />
    </group>
  );
};

export default GridFloor;
