import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";

import { _loc_to_xy, _xy_to_loc } from "../../utils/geo";

import FileInputZip from "../../components/hgt-viewer/file-input-zip/file-input-zip.component";
import HgtGrid2D from "../../components/hgt-viewer/hgt-grid-2d/hgt-grid-2d.component";
import MiniMap from "../../components/hgt-viewer/mini-map/mini-map.component";
import DownloadSet from "../../components/hgt-viewer/download-set/download-set.component";

export const useXyMemo = (
  heights:
    | {
        [k: string]: ArrayBuffer;
      }
    | undefined
) => {
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
  return {
    grid,
    d: { sizex, sizey },
    b: bounds,
    xys,
    find: locatorByGridIndices,
  };
};

const HgtZipContents = ({
  filenames,
  zipResults,
}: {
  filenames: Array<string> | undefined;
  zipResults: Array<ArrayBuffer> | undefined;
}) => {
  const heights = useMemo(
    () =>
      filenames && zipResults
        ? Object.fromEntries(filenames.map((f, i) => [f, zipResults[i]]))
        : undefined,
    [filenames, zipResults]
  );
  //
  const xyMemo = useXyMemo(heights);

  const handleCellClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    rowIndex: number,
    colIndex: number,
    zipDirectoryIndex: number
  ) => {
    console.log("cell clicked", e);
    //
    console.log("grid: ", rowIndex, colIndex, zipDirectoryIndex);
    const locator = xyMemo.find(rowIndex, colIndex, zipDirectoryIndex);
    //
    console.log("locator: ", locator, "filename: ", locator + ".hgt");
  };
  //
  const [selectedFilename, setSelectedFilename] = useState<
    string | undefined
  >();

  //
  // select first file, when upload file changes
  //
  useEffect(() => setSelectedFilename(filenames?.[0]), [filenames]);

  const selectedBuffer = useMemo(() => {
    if (zipResults && selectedFilename) {
      const idx = filenames?.indexOf(selectedFilename);
      //
      return idx !== undefined ? zipResults[idx] : undefined;
    }
    //
    return undefined;
  }, [zipResults, filenames, selectedFilename]);
  //
  const onSelectChanged = (e: ChangeEvent<HTMLSelectElement>) =>
    setSelectedFilename(e.target.value);
  //
  const renderFileOptions = () =>
    filenames && (
      <select onChange={(e) => onSelectChanged(e)}>
        {filenames.map((f, i) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
    );
  //
  const dataPoints = useMemo(
    () => (zipResults ? zipResults.length * 1201 * 1201 : 0),
    [zipResults]
  );
  //
  const totalPoints = useMemo(
    () => (xyMemo ? xyMemo.d.sizex * xyMemo.d.sizey * 1201 * 1201 : 0),
    [xyMemo]
  );
  //
  const displayedPoints = useMemo(
    () => (xyMemo ? xyMemo.d.sizex * xyMemo.d.sizey * 150 * 150 : 0),
    [xyMemo]
  );
  //
  return filenames ? (
    <>
      Details
      {renderFileOptions()}
      <br />
      {zipResults ? `${zipResults.length} tiles` : ""}
      {xyMemo ? ` ${xyMemo.d.sizex}x${xyMemo.d.sizey}` : ""}
      <br />
      <br />
      {dataPoints
        ? `${(dataPoints / Math.pow(10, 6)).toFixed(2)} datapoints` +
          `${((2 * dataPoints) / Math.pow(2, 20)).toFixed(2)} MB`
        : ""}
      <br />
      {displayedPoints
        ? `${(displayedPoints / Math.pow(10, 6)).toFixed(2)} points displayed` +
          `${((2 * displayedPoints) / Math.pow(2, 20)).toFixed(2)} MB`
        : ""}
      <br />
      {totalPoints
        ? `${(totalPoints / Math.pow(10, 6)).toFixed(2)} points total` +
          `${((2 * totalPoints) / Math.pow(2, 20)).toFixed(2)} MB`
        : ""}
      <br />
      <MiniMap xyMemo={xyMemo} selectedBuffer={selectedBuffer} />
      <hr />
      <HgtGrid2D heights={heights} handleCellClick={handleCellClick} />
      <hr />
    </>
  ) : null;
};

const Viewer = () => {
  const [filenames, setFilenames] = useState<Array<string>>();
  const [zipResults, setZipResults] = useState<Array<ArrayBuffer>>();
  //
  return (
    <>
      Viewer{/*  {countries.length} - {isLoading ? "Loading..." : "Ready"} */}
      <DownloadSet />
      <hr />
      <FileInputZip setFilenames={setFilenames} setZipResults={setZipResults} />
      <hr />
      <HgtZipContents filenames={filenames} zipResults={zipResults} />
      <div>
        Prepare:
        <ol>
          <li>+Select a file</li>
          <li>+Read compressed bytes</li>
          <li>+Decompress data</li>
        </ol>
        Process:
        <ol>
          <li>+Locate tiles by filename</li>
          <li>+Create grid helper</li>
          <li>+Render 2D grid</li>
          <li>Render 2D selected tile</li>
        </ol>
      </div>
    </>
  );
};

export default Viewer;
