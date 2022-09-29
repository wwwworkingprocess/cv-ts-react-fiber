import { useMemo } from "react";

import HgtGridCell2D from "../hgt-grid-cell-2d/hgt-grid-cell-2d.component";
import HgtThumbnail, {
  HgtThumbnailWater,
} from "../hgt-thumbnail/hgt-thumbnail.component";

import useXyMemo from "../../../hooks/srtm/useXyMemo";

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
        position: "relative",
        width: xyMemo ? `${xyMemo.grid?.[0]?.[0].length * (150 + 2)}px` : "0px",
      }}
    >
      {xyMemo &&
        xyMemo.grid.map((row, ri: number, rows) => (
          <HgtGridRow key={`row_${ri}`} width={rows[0].length * (150 + 2)}>
            <HgtGridColumns height={150}>
              {row.map(({ ci, xy, l, zi }, cidx, cols) => (
                <HgtGridCell
                  key={`cell_${ri}_${cidx}`}
                  width={150}
                  height={150}
                  // onClick={(e) => handleCellClick(e, ri, cidx, zi)}
                >
                  <HgtGridCell2D
                    locator={l}
                    rowIndex={ri}
                    colIndex={ci}
                    zipIndex={zi}
                    handleCellClick={handleCellClick}
                  >
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
        ))}
    </div>
  );
};

export default HgtGrid2D;
