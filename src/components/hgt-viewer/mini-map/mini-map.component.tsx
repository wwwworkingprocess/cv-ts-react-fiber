import { useMemo } from "react";

import { _xy_to_loc } from "../../../utils/geo";

import HgtThumbnail from "../hgt-thumbnail/hgt-thumbnail.component";
import { MiniMapCrosshair } from "./mini-map.styles";

const MiniMap = (props: {
  xyMemo: any;
  selectedBuffer: ArrayBuffer | undefined;
}) => {
  const { xyMemo, selectedBuffer } = props;
  //
  const crossHairMemo = useMemo(() => {
    if (xyMemo) {
      const { b } = xyMemo;
      if (b) {
        const bottomLeft = _xy_to_loc([b.min_x, b.min_y]);
        const topRight = _xy_to_loc([b.max_x, b.max_y]);
        const [halfWidth, halfHeight] = [(10 + 2) * 0.5, (10 + 2) * 0.5]; // self height 5x5 px div, with 1p border around 7x7
        //
        const cp = [
          b.min_x + (b.max_x - b.min_x) * 0.5,
          b.min_y + (b.max_y - b.min_y) * 0.5,
        ] as [number, number];
        //
        const centerPoint = _xy_to_loc(cp);
        const downscale = 0.5; // image is 180x90 not 360x180
        //
        // 0,0 is at (360/2) , (180/2)
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
  }, [xyMemo]);

  return (
    <div>
      <img
        alt="minimap"
        style={{ width: "180px", height: "90px" }}
        src="data/earth/diffuse.jpg"
      />
      {selectedBuffer && <HgtThumbnail hgtBuffer1201={selectedBuffer} />}
      {crossHairMemo && (
        <MiniMapCrosshair
          width={10}
          height={10}
          top={crossHairMemo.top}
          left={crossHairMemo.left}
          // style={{
          //   position: "relative",
          //   // top: crossHairMemo.topPx,
          //   // left: crossHairMemo.leftPx,
          //   width: "10px",
          //   height: "10px",
          //   border: "solid 1px red",
          // }}
        />
      )}
    </div>
  );
};

export default MiniMap;
