import { ChangeEvent, useEffect, useMemo, useState } from "react";

import type { Origin } from "../../../routes/viewer/viewer.types";

import HgtGrid2D from "../hgt-grid-2d/hgt-grid-2d.component";
import HgtThumbnail from "../hgt-thumbnail/hgt-thumbnail.component";
import MiniMap from "../mini-map/mini-map.component";

import useXyMemo from "../../../hooks/srtm/useXyMemo";

import {
  HgtScrollable2DGrid,
  HgtZipContentFileDetailsContainer,
  HgtZipContentLayoutGrid,
  HgtZipContentLayoutGridCell,
} from "./hgt-zip-contents.styles";

type HgtZipContentsProps = {
  filenames: Array<string> | undefined;
  zipResults: Array<ArrayBuffer> | undefined;
  selectedOrigin: Origin | undefined;
  setSelectedOrigin: React.Dispatch<React.SetStateAction<Origin | undefined>>;
};

//
//
//
const HgtZipContents = ({
  filenames,
  zipResults,
  selectedOrigin,
  setSelectedOrigin,
}: HgtZipContentsProps) => {
  const heights = useMemo(
    () =>
      filenames && zipResults
        ? Object.fromEntries(filenames.map((f, i) => [f, zipResults[i]]))
        : undefined,
    [filenames, zipResults]
  );
  //
  const xyMemo = useXyMemo(heights);
  //
  const handleCellClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    rowIndex: number,
    colIndex: number,
    zipDirectoryIndex: number,
    x: number,
    y: number,
    newOrigin?: Origin
  ) => {
    // const locator = xyMemo.find(rowIndex, colIndex, zipDirectoryIndex);
    //
    // console.log("cell clicked", newOrigin, e);
    // console.log("x,y", x, y);
    // console.log("grid: ", rowIndex, colIndex, zipDirectoryIndex);
    // console.log("locator: ", locator, "filename: ", locator + ".hgt");
    //
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

export default HgtZipContents;
