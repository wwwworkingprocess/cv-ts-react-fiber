import { useMemo } from "react";

import { _xy_to_loc } from "../../../utils/geo";

import {
  MiniMapContainer,
  MiniMapCrosshair,
  MiniMapImage,
} from "./mini-map.styles";

const useCrossHairMemo = (xyMemo: any, downscale: number) => {
  const crossHairMemo = useMemo(() => {
    if (xyMemo) {
      const { b } = xyMemo;
      if (b) {
        const bottomLeft = _xy_to_loc([b.min_x, b.min_y]);
        const topRight = _xy_to_loc([b.max_x, b.max_y]);
        const [halfWidth, halfHeight] = [(10 + 2) * 0.5, (10 + 2) * 0.5]; // self height 5x5 px div, with 1p border around 7x7
        //
        const cp = [
          b.min_x + (1 + b.max_x - b.min_x) * 0.5,
          b.min_y + (1 + b.max_y - b.min_y) * 0.5,
        ] as [number, number];
        //
        const centerPoint = _xy_to_loc(cp);
        //
        // 0,0 is at (360/2) , (180/2) when downscale is 0.5
        //
        const left = 0 - halfWidth + 90 + cp[1] * downscale; // [0..360] -> [0..180]
        const top = -3 - halfHeight - 45 - cp[0] * downscale; // [0..180] -> [0..-90]
        //
        return {
          bottomLeft,
          topRight,
          centerPoint,
          x: [b.min_x, b.max_x],
          y: [b.min_y, b.max_y],
          cp,
          left,
          top,
        };
      }
    }
  }, [xyMemo, downscale]);
  //
  return crossHairMemo;
};

const MiniMap = (props: { xyMemo: any }) => {
  const { xyMemo } = props;
  //
  const downscale = 0.5; // image is 180x90 not 360x180
  //
  const crossHairMemo = useCrossHairMemo(xyMemo, downscale);
  //
  return (
    <MiniMapContainer>
      <MiniMapImage
        width={180}
        height={90}
        alt="minimap"
        src="data/earth/diffuse.jpg"
      />
      {crossHairMemo && (
        <MiniMapCrosshair
          width={10}
          height={10}
          top={crossHairMemo.top}
          left={crossHairMemo.left}
        />
      )}
    </MiniMapContainer>
  );
};

export default MiniMap;
