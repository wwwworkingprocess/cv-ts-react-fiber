import { useCallback, useEffect, useState } from "react";
import { unzipBufferMulti } from "../../utils/deflate";

import {
  changeEndianness,
  normalizeElevationData,
  removeLastRowAndColumn,
} from "../../utils/srtm";

const SERVICE_ROOT = "data/hgt/";

//
// Retrieves HGT information based on SRTM 3.0
//
const useSrtmTiles = (locator: string) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [values, setValues] = useState<
    Record<string, Int16Array> | undefined
  >();

  const [error, setError] = useState<Error | undefined>();
  //
  const onNetworkError = useCallback(
    (error: Error) => {
      console.error("network error", locator, error);
      //
      setError(error);
    },
    [locator]
  );
  //
  const onDeflateError = useCallback(
    (error: Error) => {
      const { message } = error;
      //
      if (message === "End of central directory not found") {
        onNetworkError(
          new Error(`Requested SRTM tile [${locator}.hgt.zip] does not exists.`)
        );
      } else {
        console.error("Error during deflate", error);
        //
        setError(error);
      }
    },
    [locator, onNetworkError]
  );
  //
  const onDownloadSuccess = useCallback(
    (ab: ArrayBuffer | null) => {
      console.log("downloaded zip (multi)", ab);
      //
      if (ab) {
        const transform = (e: ArrayBuffer) =>
          normalizeElevationData(changeEndianness(removeLastRowAndColumn(e)));
        //
        const createResultObject = async ({
          files,
          results,
        }: {
          files: Array<string>;
          results: Promise<Array<ArrayBuffer>>;
        }) => {
          console.log("received", files, results);
          //
          const buffers = await results;
          //
          const resultObject = Object.fromEntries(
            files.map((f, i) => [f, transform(buffers[i])])
          );
          return resultObject;
        };
        //
        unzipBufferMulti(ab)
          .then(createResultObject)
          .then(setValues)
          .catch(onDeflateError);
      }
    },
    [onDeflateError]
  );

  //
  //
  const fetchApi = useCallback(
    (code: string) => {
      if (code) {
        console.log("fetching", locator);
        //
        const url = `${SERVICE_ROOT}${locator}.hgt.zip`;
        //
        fetch(url)
          .then((response) => response.arrayBuffer())
          .then(onDownloadSuccess)
          .catch(onNetworkError)
          .finally(() => setLoading(false));
      }
    },
    [locator, onDownloadSuccess, onNetworkError]
  );
  //
  useEffect(() => {
    setLoading(true);
    setValues(undefined);
    setError(undefined);

    fetchApi(locator);
  }, [fetchApi, locator]);
  //
  return { loading, values, error };
};

export default useSrtmTiles;
