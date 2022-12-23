import { useCallback, useMemo } from "react";

const useDragAndDrop = (
  refDrag: React.MutableRefObject<boolean>,
  controlsRef: React.MutableRefObject<any>,
  refDynamicText: React.MutableRefObject<string>,
  coordsFromPosition: (arr: Array<string>) => [number, number],
  setBoxGeoPosition: (
    value: React.SetStateAction<[number, number] | undefined>
  ) => void
) => {
  const onDragStart = useCallback(
    (event: any) => {
      refDrag.current = true;
      //
      if (controlsRef.current) controlsRef.current.enabled = false;
    },
    [controlsRef, refDrag]
  );
  //
  const onDragEnd = useCallback(
    (event: any) => {
      if (controlsRef.current) controlsRef.current.enabled = true;
      //
      refDrag.current = false;
      //
      const nextPosition = event.eventObject.position
        .toArray()
        .map((coord: number) => coord.toFixed(3));
      //
      const nextCoords = coordsFromPosition(nextPosition);
      //
      refDynamicText.current = nextCoords
        ? `${nextCoords[0].toFixed(3)}, ${nextCoords[1].toFixed(3)}}`
        : "";
      //
      setBoxGeoPosition(nextCoords);
    },
    [
      controlsRef,
      refDrag,
      refDynamicText,
      coordsFromPosition,
      setBoxGeoPosition,
    ]
  );
  //
  return useMemo(() => ({ onDragStart, onDragEnd }), [onDragStart, onDragEnd]);
};

export default useDragAndDrop;
