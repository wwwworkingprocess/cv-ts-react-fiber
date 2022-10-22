import { useCallback, useMemo } from "react";

import { Mesh, Vector3 } from "three";

//
// auto zooming and panning, using the provided setters
//
const useMapAutoPanningActions = (
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
        setZoom(true);
        setFocus(new Vector3(position[0], position[1], position[2]));
      }
    },
    [cities, setZoom, setFocus]
  );
  //
  return useMemo(
    () => ({ zoomToView, zoomToViewByCode }),
    [zoomToView, zoomToViewByCode]
  );
};

export default useMapAutoPanningActions;
