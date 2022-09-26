import { FC, MouseEvent } from "react";
import useMousePosition from "../../../hooks/useMousePosition";
import { _loc_to_xy } from "../../../utils/geo";
import {
  HgtGridCellBackground,
  HgtGridCellForeground,
} from "./hgt-grid-cell-2d.styles";

const HgtGridCell2D: FC<{
  locator: string;
  rowIndex: number;
  colIndex: number;
  zipIndex: number;
  handleCellClick: any;
  children: any;
}> = (props: {
  locator: string;
  rowIndex: number;
  colIndex: number;
  zipIndex: number;
  handleCellClick: any;
  children: any;
}) => {
  const { locator, rowIndex, colIndex, zipIndex, handleCellClick, children } =
    props;
  //
  const [x, y, bind] = useMousePosition();
  //
  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    console.log("tile click", x, y, locator);
    //
    const toOffset = (a: number, min: number, max: number) =>
      Math.min(max, Math.max(a, min)) / max;

    const ox = toOffset(x, 0, 150); // mouse vertical
    const oy = toOffset(y, 0, 150); // mouse horizontal
    //
    /*
    The names of individual data tiles refer to the latitude and longitude of the southwest (lower
      left) corner of the tile. For example, N37W105 has its lower left corner at 37°N latitude and
      105° West (W) longitude and covers (slightly more than) the area 37-38°N and 104-105°W. To
      be more exact, the file name coordinates refer to the geometric center of the lower-left pixel,
      and all edge pixels of the tile are centered on whole-degree lines of latitude and/or longitude.
      The unit of elevation is meters as referenced to the WGS84/EGM96 geoid (NGA, 1997;Lemoine,
      1998)
      */
    //
    const lowerleft = _loc_to_xy(locator); // N39W032 -> [39, -32]
    //
    // To get the [lat,lon] based on the lower-left corner and the offsets
    // we need to invert the x-axis, as 'mouse position is from top-to-bottom'
    // but latitude values are from 'bottom-to-top'. Tile size is 1° x 1°
    //
    const [baseLat, baseLon] = lowerleft;
    const lat = 1 + baseLat - oy; // vertical axis
    const lon = baseLon + ox; // horizontal axis

    console.log("offsets", ox, oy, x, y);
    console.log("lowerleft", locator, lowerleft);
    console.log("lat,lon", { lat, lon });
    //
    const newOrigin = { locator, lat, lon, zipIndex };
    //
    handleCellClick(e, rowIndex, colIndex, zipIndex, x, y, newOrigin);
  };
  //
  return (
    <div {...bind} onClick={onClick}>
      <HgtGridCellBackground width={150}>{children}</HgtGridCellBackground>
      <HgtGridCellForeground width={150} height={150}>
        <h5>{locator}</h5>
        <div>{zipIndex !== -1 ? zipIndex : " "}</div>
        <small>
          {x}x{y}
        </small>
      </HgtGridCellForeground>
    </div>
  );
};

export default HgtGridCell2D;
