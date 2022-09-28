import { useCallback, useEffect, useState } from "react";
import { unzipBufferMulti } from "../../utils/deflate";

import {
  changeEndianness,
  normalizeElevationData,
  removeLastRowAndColumn,
} from "../../utils/srtm";

const SERVICE_ROOT = "data/hgt/";

export enum SAMPLING_MODE {
  SKIP_SAMPLING = 1201,
  SAMPLE_TO_1200X1200 = 1200,
  SAMPLE_TO_600X600 = 600,
  SAMPLE_TO_300X300 = 300,
  SAMPLE_TO_150X150 = 150,
  SAMPLE_TO_2X2 = 2,
}
//
// Retrieves HGT information based on SRTM 3.0
//
const useSrtmTiles = (locator: string, mode: SAMPLING_MODE) => {
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
        let transform: (int16a: ArrayBuffer) => Int16Array;
        //
        switch (mode) {
          case SAMPLING_MODE.SKIP_SAMPLING:
            transform = (e: ArrayBuffer) =>
              normalizeElevationData(changeEndianness(new Int16Array(e)));
            break;
          case SAMPLING_MODE.SAMPLE_TO_1200X1200:
            transform = (e: ArrayBuffer) =>
              normalizeElevationData(
                changeEndianness(removeLastRowAndColumn(e))
              );
            break;
          case SAMPLING_MODE.SAMPLE_TO_600X600:
            {
              const throwOddRowsAndCols = (i16: Int16Array) => {
                //
                // input is 1200x1200 not 1201x1201
                // output is 600x600
                //
                const bitmap_600_600 = i16.filter((v, i, a) => {
                  const col_idx = i % 1200;
                  const row_idx = (i - col_idx) / 1200;
                  //
                  const isNotEvenCol = col_idx % 2 === 0; // every odd column
                  const isNotEvenRow = row_idx % 2 === 0; // every odd row
                  //
                  return !isNotEvenCol && !isNotEvenRow;
                });
                //
                return bitmap_600_600;
              };
              //
              transform = (e: ArrayBuffer) =>
                normalizeElevationData(
                  changeEndianness(
                    throwOddRowsAndCols(removeLastRowAndColumn(e))
                  )
                );
            }
            break;
          case SAMPLING_MODE.SAMPLE_TO_300X300:
            {
              const keepEveryFourthRowAndCol = (i16: Int16Array) => {
                //
                // input is 1200x1200 not 1201x1201
                // output is 300x300
                //
                const bitmap_300_300 = i16.filter((v, i, a) => {
                  const ci = i % 1200;
                  const ri = (i - ci) / 1200;

                  const isFourthCol = ci % 4 === 0;
                  const isFourthRow = ri % 4 === 0;
                  //
                  return isFourthCol && isFourthRow;
                });
                //
                return bitmap_300_300;
              };
              //

              //
              transform = (e: ArrayBuffer) =>
                normalizeElevationData(
                  changeEndianness(
                    keepEveryFourthRowAndCol(removeLastRowAndColumn(e))
                  )
                );
            }
            break;
          case SAMPLING_MODE.SAMPLE_TO_150X150:
            {
              const keepEveryEightRowAndCol = (i16: Int16Array) => {
                //
                // input is 1200x1200 not 1201x1201
                // output is 150x150
                //
                const bitmap_150_150 = i16.filter((v, i, a) => {
                  const col_idx = i % 1200;
                  const row_idx = (i - col_idx) / 1200;

                  const isFourthCol = col_idx % 8 === 0;
                  const isFourthRow = row_idx % 8 === 0;
                  //
                  return isFourthCol && isFourthRow;
                });
                //
                return bitmap_150_150;
              };
              transform = (e: ArrayBuffer) =>
                normalizeElevationData(
                  changeEndianness(
                    keepEveryEightRowAndCol(removeLastRowAndColumn(e))
                  )
                );
            }
            break;
          //
        }
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
    [onDeflateError, mode]
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
    setValues(undefined);
    setError(undefined);

    fetchApi(locator);
  }, [fetchApi, locator]);
  //
  return { loading, values, error };
};

export default useSrtmTiles;
