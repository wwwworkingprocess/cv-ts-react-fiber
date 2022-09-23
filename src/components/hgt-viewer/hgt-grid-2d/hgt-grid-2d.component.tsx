import { useMemo } from "react";
import { useXyMemo } from "../../../routes/viewer/viewer.component";
import HgtGridCell2D from "../hgt-grid-cell-2d/hgt-grid-cell-2d.component";

import HgtThumbnail, {
  HgtThumbnailWater,
} from "../hgt-thumbnail/hgt-thumbnail.component";

import { HgtGridCell, HgtGridColumns, HgtGridRow } from "./hgt-grid-2d.styles";

const HgtGrid2D = (props: {
  heights:
    | {
        [k: string]: ArrayBuffer;
      }
    | undefined;
  handleCellClick: any;
}) => {
  const { heights, handleCellClick } = props;
  //
  const zipResults = useMemo(() => Object.values(heights || {}), [heights]);
  const xyMemo = useXyMemo(heights);
  //
  return (
    <div
      style={{
        width: xyMemo ? `${xyMemo.grid?.[0]?.[0].length * (150 + 2)}px` : "0px",
      }}
    >
      {xyMemo
        ? xyMemo.grid.map((row, ri: number, rows) => (
            <HgtGridRow key={`row_${ri}`} width={rows[0].length * (150 + 2)}>
              <HgtGridColumns height={150}>
                {row.map(({ ci, xy, l, zi }, cidx, cols) => (
                  <HgtGridCell
                    key={`cell_${ri}_${cidx}`}
                    width={150}
                    height={150}
                    onClick={(e) => handleCellClick(e, ri, cidx, zi)}
                  >
                    <HgtGridCell2D locator={l} zipIndex={zi}>
                      {zipResults && zi !== -1 ? (
                        <HgtThumbnail hgtBuffer1201={zipResults[zi]} />
                      ) : (
                        <HgtThumbnailWater sampling={150} />
                      )}
                    </HgtGridCell2D>
                  </HgtGridCell>
                ))}
              </HgtGridColumns>
            </HgtGridRow>
          ))
        : ""}
    </div>
  );
};

export default HgtGrid2D;
