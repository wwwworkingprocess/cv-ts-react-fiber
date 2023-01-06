import { useCallback, useMemo } from "react";

import { Mesh, Vector3 } from "three";

//
// auto zooming and panning, using the provided setters
//
const useMapAutoPanningActions = (
  countryCode: string | undefined,
  cities: Array<{
    code: number;
    name: string;
    position: any[];
    color: string;
  }>,
  //
  setZoom: (b: boolean) => void,
  setFocus: any,
  setSelectedCode: (c: string | undefined) => void
) => {
  const zoomToView = useCallback(
    (focusRef?: React.MutableRefObject<Mesh>) => {
      if (focusRef) {
        setZoom(true);
        setFocus(focusRef.current.position);
      } else {
        setZoom(false);
        setSelectedCode(undefined);
      }
    },
    [setZoom, setFocus, setSelectedCode]
  );

  //
  //
  //
  const zoomToViewByCode = useCallback(
    (code: string | undefined) => {
      const numericCode = parseInt((code || "").replace("Q", ""));
      const node = cities.filter((c) => c.code === numericCode)[0];
      //
      if (node) {
        const { position } = node;
        //
        const nextZoom = code !== undefined && countryCode !== code;
        //
        setZoom(nextZoom);
        setFocus(new Vector3(position[0], position[1], position[2]));
      }
    },
    [countryCode, cities, setZoom, setFocus]
  );
  //
  return useMemo(
    () => ({ zoomToView, zoomToViewByCode }),
    [zoomToView, zoomToViewByCode]
  );
};

export default useMapAutoPanningActions;
