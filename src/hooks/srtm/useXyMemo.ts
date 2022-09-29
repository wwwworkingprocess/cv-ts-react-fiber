import { useCallback, useMemo } from "react";
import { _loc_to_xy, _xy_to_loc } from "../../utils/geo";

const useXyMemo = (heights: { [k: string]: ArrayBuffer } | undefined) => {
  const keys = Object.keys(heights || {});
  //
  const xys = useMemo(
    () => keys.map((k) => [k, _loc_to_xy(k)] as [string, [number, number]]),
    [keys]
  );
  //
  let min_x: number | undefined = undefined;
  let max_x: number | undefined = undefined;
  let min_y: number | undefined = undefined;
  let max_y: number | undefined = undefined;
  //
  if (xys.length) {
    const first = xys[0][1] as [number, number];
    //
    min_x = first[0];
    max_x = first[0];
    min_y = first[1];
    max_y = first[1];
    //
    for (let i = 1; i < xys.length; i++) {
      const xy = xys[i][1];
      //
      if (xy[0] < min_x) min_x = xy[0];
      if (xy[0] > max_x) max_x = xy[0];
      //
      if (xy[1] < min_y) min_y = xy[1];
      if (xy[1] > max_y) max_y = xy[1];
    }
  }
  //
  // x is vertical (North/South)
  // y is horizontal (West/East)
  //
  const sizex =
    min_x !== undefined && max_x !== undefined ? max_x - min_x + 1 : 0; // rows
  const sizey =
    min_y !== undefined && max_y !== undefined ? max_y - min_y + 1 : 0; // cols
  //
  const rows = new Array(sizex).fill(0);
  const cols = new Array(sizey).fill(0);
  //
  /**
   * The rows are rendered in reverse order, so the
   * first component is calculated as (height - (vertical position) )
   */
  const locatorByGridIndices = useCallback(
    (row_idx: number, col_idx: number, orig_idx: number) => {
      const [mx, my] = [min_x ?? 0, min_y ?? 0];
      const xy = [sizex - 1 - row_idx + mx, col_idx + my] as [number, number];
      //
      return _xy_to_loc(xy);
    },
    [min_x, min_y, sizex]
  );
  //
  const grid = useMemo(
    () =>
      rows
        .map((r, ri) => [
          ...cols.map((_, ci) => {
            const [mx, my] = [min_x ?? 0, min_y ?? 0];
            const xy = [ri + mx, ci + my] as [number, number];
            const l = _xy_to_loc(xy);
            const orig_idx = keys.indexOf(`${l}.hgt`);
            r = {
              ci,
              xy,
              l: orig_idx !== -1 ? l : " - ",
              zi: orig_idx,
            };
            //
            return r;
          }),
        ])
        .reverse(),
    [keys, rows, cols, min_x, min_y]
  );
  //
  const bounds = useMemo(
    () =>
      min_x !== undefined &&
      max_x !== undefined &&
      min_y !== undefined &&
      max_y !== undefined
        ? { min_x, max_x, min_y, max_y }
        : undefined,
    [min_x, max_x, min_y, max_y]
  );
  //
  return useMemo(
    () => ({
      grid,
      d: { sizex, sizey },
      b: bounds,
      xys,
      find: locatorByGridIndices,
    }),
    [grid, sizex, sizey, bounds, xys, locatorByGridIndices]
  );
};

export default useXyMemo;
