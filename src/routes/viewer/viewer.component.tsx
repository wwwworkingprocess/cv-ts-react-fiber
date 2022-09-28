import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";

import { _loc_to_xy, _xy_to_loc } from "../../utils/geo";

import FileInputZip from "../../components/hgt-viewer/file-input-zip/file-input-zip.component";
import HgtGrid2D from "../../components/hgt-viewer/hgt-grid-2d/hgt-grid-2d.component";
import MiniMap from "../../components/hgt-viewer/mini-map/mini-map.component";
import DownloadSet from "../../components/hgt-viewer/download-set/download-set.component";
import { changeEndianness, normalizeElevationData } from "../../utils/srtm";
import HgtThumbnail, {
  imagedata_to_dataurl,
} from "../../components/hgt-viewer/hgt-thumbnail/hgt-thumbnail.component";
import coloring from "../../utils/colors";
import HgtSetViewer3D from "../../fiber-apps/hgt-set-viewer/hgt-set-viewer-3d";
import { unzipBufferMulti } from "../../utils/deflate";
import Dialog from "../../components/dialog/dialog.component";
import {
  HgtScrollable2DGrid,
  HgtZipContentFileDetailsContainer,
  HgtZipContentLayoutGrid,
  HgtZipContentLayoutGridCell,
} from "./viewer.styles";

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

const HgtZipContents = ({
  filenames,
  zipResults,
  selectedOrigin,
  setSelectedOrigin,
}: {
  filenames: Array<string> | undefined;
  zipResults: Array<ArrayBuffer> | undefined;
  selectedOrigin: Origin | undefined;
  setSelectedOrigin: React.Dispatch<React.SetStateAction<Origin | undefined>>;
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
    zipDirectoryIndex: number,
    x: number,
    y: number,
    newOrigin?: Origin
  ) => {
    console.log("cell clicked", newOrigin, e);
    console.log("x,y", x, y);
    //
    console.log("grid: ", rowIndex, colIndex, zipDirectoryIndex);
    const locator = xyMemo.find(rowIndex, colIndex, zipDirectoryIndex);
    //
    console.log("locator: ", locator, "filename: ", locator + ".hgt");
    //
    // const newOrigin = { locator x, y}
    if (newOrigin) setSelectedOrigin(newOrigin);
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
    if (zipResults && filenames && selectedFilename) {
      const idx = filenames?.indexOf(selectedFilename);
      //
      const nextBuffer = idx !== -1 ? zipResults[idx] : undefined;
      const nextBufferLength = nextBuffer?.byteLength ?? 0;
      const validBuffer = nextBufferLength === 2884802;
      //
      if (!validBuffer) {
        // alert(`Invalid file size: ${nextBufferLength} [${selectedFilename}]`);
        //
        // when switching between zips, filenames and selectedFilename gets out of sync
        //
      }
      //
      return validBuffer ? nextBuffer : undefined;
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
      <select onChange={(e) => onSelectChanged(e)} style={{ fontSize: "14px" }}>
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
  // 3 column layout,  [minimap, filemeta, selectedbuffer]
  //
  return filenames ? (
    <>
      <HgtZipContentLayoutGrid>
        <HgtZipContentLayoutGridCell>
          <MiniMap xyMemo={xyMemo} />
        </HgtZipContentLayoutGridCell>
        <HgtZipContentLayoutGridCell>
          <HgtZipContentFileDetailsContainer>
            Files: {renderFileOptions()}
            <br />
            {zipResults ? `Tiles: ${zipResults.length}` : ""}
            <br />
            {xyMemo ? `Area: ${xyMemo.d.sizex}x${xyMemo.d.sizey}` : ""}
            <br />
            {dataPoints
              ? `Size: ${((2 * dataPoints) / Math.pow(2, 20)).toFixed(2)} MB`
              : ""}
          </HgtZipContentFileDetailsContainer>
        </HgtZipContentLayoutGridCell>
        <HgtZipContentLayoutGridCell style={{ width: "120px" }}>
          {selectedBuffer && (
            <HgtThumbnail hgtBuffer1201={selectedBuffer} zoom={0.75} />
          )}
        </HgtZipContentLayoutGridCell>
      </HgtZipContentLayoutGrid>
      <br />
      {!selectedOrigin && (
        <div style={{ textAlign: "center" }}>
          Please click the map below to start
        </div>
      )}
      <hr />
      <HgtScrollable2DGrid>
        <HgtGrid2D heights={heights} handleCellClick={handleCellClick} />
      </HgtScrollable2DGrid>
      <hr />
    </>
  ) : null;
};

export type Origin = {
  locator: string;
  lat: number;
  lon: number;
  zipIndex: number;
};

export const HgtTileDetails = (props: {
  tileBuffer: ArrayBuffer | undefined;
}) => {
  const { tileBuffer } = props;
  //
  const transformInput = (buffer: ArrayBuffer | undefined) => {
    //
    // [1201x1201] >> endian + normalize
    //
    const transform = (e: ArrayBuffer) =>
      normalizeElevationData(changeEndianness(new Int16Array(e)));
    //
    return buffer ? transform(buffer) : undefined;
  };
  //
  const createImageData = (i16: Int16Array | undefined) => {
    if (!i16) return undefined;
    //
    const id = new ImageData(1201, 1201);
    //
    for (let i = 0; i < i16.length; i++) {
      const height = i16[i];
      const c = coloring.get_color_by_height(height);
      //
      const offset = i * 4;
      id.data[offset] = c.r; // R value
      id.data[offset + 1] = c.g; // G value
      id.data[offset + 2] = c.b; // B value
      id.data[offset + 3] = 255; // A value
    }
    //
    return id;
  };
  //
  const dataurl = useMemo(() => {
    if (tileBuffer) {
      //
      const i16 = transformInput(tileBuffer);
      const imagedata = createImageData(i16);
      //
      return imagedata
        ? imagedata_to_dataurl(imagedata, 1201, 1201)
        : undefined;
    }
  }, [tileBuffer]);

  //
  return (
    <div>
      <div>
        1201x1201 image
        <img
          alt={""}
          src={dataurl}
          style={{ width: "1201px", height: "1201px", zoom: 0.5 }}
        />
      </div>
    </div>
  );
};

const Viewer = () => {
  const [filenames, setFilenames] = useState<Array<string>>();
  const [zipResults, setZipResults] = useState<Array<ArrayBuffer>>();
  const [selectedOrigin, setSelectedOrigin] = useState<Origin>();
  //
  const heights = useMemo(() => {
    if (!filenames || !zipResults) return undefined;
    //
    return Object.fromEntries(filenames.map((f, idx) => [f, zipResults[idx]]));
  }, [filenames, zipResults]);
  //
  //
  const [has2D, setHas2D] = useState<boolean>(true);
  const [has3D, setHas3D] = useState<boolean>(true);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] =
    useState<boolean>(false);

  //
  const onUseLocalDataset = (locator: string) => {
    //
    // fetching local data instead of the user provided input
    // works for mobile devices, instead of the HtmlInputFile control
    //
    const SERVICE_ROOT = "data/hgt/";
    const url = `${SERVICE_ROOT}${locator}.hgt.zip`;
    //
    const createResultObject = async ({
      files,
      results,
    }: {
      files: Array<string>;
      results: Promise<Array<ArrayBuffer>>;
    }) => {
      const buffers = await results;
      //
      return { files, buffers };
    };
    //
    if (locator) {
      setFilenames(undefined);
      setZipResults(undefined);
      //
      fetch(url)
        .then((res) => res.arrayBuffer())
        .then(unzipBufferMulti)
        .then(createResultObject)
        .then(({ files, buffers }) => {
          setFilenames(files);
          setZipResults(buffers);
        });
    }
  };
  //
  return (
    <>
      <h2>Topographic MapViewer</h2>
      <p>
        Please provide a .zip archive, with elevation data in .hgt format.
        <br /> Use sample file A - B - C or click the 'Find a set' button.
      </p>
      <div style={{ width: "120px", textAlign: "right", float: "right" }}>
        2D:{" "}
        <input
          type="checkbox"
          checked={has2D}
          onChange={(e) => setHas2D((b) => !b)}
        />{" "}
        3D:{" "}
        <input
          type="checkbox"
          checked={has3D}
          onChange={(e) => setHas3D((b) => !b)}
        />
      </div>
      <hr />
      File: <button onClick={(e) => onUseLocalDataset("J26")}>A</button>
      <button onClick={(e) => onUseLocalDataset("SC56")}>B</button>
      <button onClick={(e) => onUseLocalDataset("B44")}>C</button>
      <FileInputZip setFilenames={setFilenames} setZipResults={setZipResults} />
      <span style={{ float: "right" }}>
        <button onClick={(e) => setIsDownloadDialogOpen((b) => !b)}>
          Find a set
        </button>
      </span>
      <Dialog
        isOpen={isDownloadDialogOpen}
        onClose={(e: CloseEvent) => setIsDownloadDialogOpen(false)}
      >
        <DownloadSet />
      </Dialog>
      <hr />
      {has2D && (
        <HgtZipContents
          filenames={filenames}
          zipResults={zipResults}
          selectedOrigin={selectedOrigin}
          setSelectedOrigin={setSelectedOrigin}
        />
      )}
      <hr />
      {selectedOrigin && selectedOrigin.locator !== "-"
        ? `${selectedOrigin.locator}, ${selectedOrigin.lat.toFixed(
            4
          )}, ${selectedOrigin.lon.toFixed(4)} `
        : ""}
      <hr />
      {has3D && zipResults && selectedOrigin && (
        <HgtSetViewer3D
          heights={heights}
          selectedOrigin={selectedOrigin}
          isCameraEnabled={true}
          isFrameCounterEnabled={false}
        />
      )}
    </>
  );
};

export default Viewer;
