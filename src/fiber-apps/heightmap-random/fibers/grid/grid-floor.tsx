import { useEffect, useMemo, useState } from "react";

import { Color, Vector3 } from "three";
import { SAMPLING_MODE } from "../../../../hooks/srtm/useSrtmTiles";

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
    sampling: SAMPLING_MODE;
  }
) => {
  const { i, j, setHeightViewPort, sampling } = props;
  //
  const crossHairHeight = 0.75;
  const [crossHairPosition, setCrossHairPosition] = useState<Vector3>();
  //
  const unitMemo = useMemo(() => {
    const totalWidthInUnits = 10;
    //
    //TODO: ensure valid input
    //
    return [sampling / totalWidthInUnits, sampling / totalWidthInUnits];
  }, [sampling]);

  const activeViewPort = useMemo(() => {
    if (crossHairPosition) {
      //
      // Assuming floor size is 10x10 units (xz) with 10 divisions
      // on each axis, and centerpoint is at (0,0,0)
      //
      // 1. transform crosshair_pos => xz
      // 2. transform xz to viewport
      //
      const { x, z } = crossHairPosition;
      //
      const px = x + 4.5; // (5-0.5)
      const pz = 4.5 - z; // px and pz is in range [0..9]
      //
      // const [pixelPerX, pixelPerZ] = [120, 120]; // sampling / 10
      const [pixelPerX, pixelPerZ] = unitMemo; // [1200 / 10, 1200 / 10]; // sampling / 10
      //
      const newViewport = [
        px * pixelPerX,
        pz * pixelPerZ,
        (px + 1) * pixelPerX,
        (pz + 1) * pixelPerZ,
      ];
      //
      return newViewport as [number, number, number, number];
    }
    //
    return undefined;
  }, [crossHairPosition, unitMemo]);

  useEffect(() => {
    setHeightViewPort(activeViewPort);
    //  }, [activeViewPort, setHeightViewPort]);
  }, [activeViewPort]);

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
