import { useMemo, useState } from "react";

import HgtSetViewer3D from "../../fiber-apps/hgt-set-viewer/hgt-set-viewer-3d";

import { unzipBufferMulti } from "../../utils/deflate";

import FileInputZip from "../../components/hgt-viewer/file-input-zip/file-input-zip.component";
import DownloadSet from "../../components/hgt-viewer/download-set/download-set.component";
import HgtZipContents from "../../components/hgt-viewer/hgt-zip-contents/hgt-zip-contents.component";
import Dialog from "../../components/dialog/dialog.component";

import type { Origin } from "./viewer.types";

import { DisplayModeSelector } from "./viewer.styles";

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
      <DisplayModeSelector>
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
      </DisplayModeSelector>
      <h2>Topographic Map Viewer</h2>
      <p>
        Provide a .zip archive, with elevation data in .hgt format.
        <br /> Use sample file A - B - C or click the 'Find a set' button.
      </p>
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
