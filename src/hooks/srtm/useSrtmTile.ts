import { useCallback, useEffect, useState } from "react";
import { unzipBuffer } from "../../utils/deflate";

import {
  changeEndianness,
  normalizeElevationData,
  removeLastRowAndColumn,
} from "../../utils/srtm";

const SERVICE_ROOT = "data/hgt/";

//
// Retrieves HGT information based on SRTM 3.0
//
const useSrtmTile = (locator: string) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [value, setValue] = useState<Int16Array | undefined>();
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
      // console.log("downloaded zip", ab);
      //
      if (ab) {
        unzipBuffer(ab)
          .then(removeLastRowAndColumn)
          .then(changeEndianness)
          .then(normalizeElevationData)
          .then(setValue)
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
    setValue(undefined);
    setError(undefined);

    fetchApi(locator);
  }, [fetchApi, locator]);
  //
  return { loading, value, error };
};

export default useSrtmTile;
