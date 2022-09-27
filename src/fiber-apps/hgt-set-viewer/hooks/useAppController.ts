import { useCallback, useEffect, useMemo } from "react";

import { Vector3 } from "three";

import useHgtSetViewerStore from "../stores/useHgtSetViewerStore";

const startPosition = { x: 1, y: 0, z: 0 };

const useAppController = (xyMemo: any) => {
  console.log("viewer controller", xyMemo);
  //
  const bounds = useHgtSetViewerStore((state) => state.bounds);
  const position = useHgtSetViewerStore((state) => state.position);
  const setPosition = useHgtSetViewerStore((state) => state.setPosition);
  const setBounds = useHgtSetViewerStore((state) => state.setBounds);
  const decreasePositionY = useHgtSetViewerStore(
    (state) => state.decreasePositionY
  );
  const onJump = useCallback(() => {
    setPosition({ ...position, y: position.y + 1 });
    decreasePositionY(500);
  }, [position, setPosition, decreasePositionY]);
  //
  const [MIN_X, MAX_X, MIN_Y, MAX_Y] = bounds;
  const { x, y, z } = position;
  //
  const areaWidth = useMemo(() => Math.abs(MAX_X + 1 - MIN_X), [MIN_X, MAX_X]);
  const areaHeight = useMemo(() => Math.abs(MAX_Y + 1 - MIN_Y), [MIN_Y, MAX_Y]);
  const areaScale = useMemo(
    () => new Vector3(areaWidth, areaHeight, 0.15),
    [areaWidth, areaHeight]
  );

  //
  // infer bounds from shape of grid, e.g ( [4x5] -> [0,4,0,5])
  //
  useEffect(() => {
    if (xyMemo) {
      const d = xyMemo.d ?? { sizex: 0, sizey: 0 };
      const scale = 4;

      const newBounds = [0, d.sizey * scale - 1, 0, d.sizex * scale - 1] as [
        number,
        number,
        number,
        number
      ];

      //
      console.log("applying new bounds", newBounds);
      //
      setBounds(newBounds);
    }
  }, []);
  //
  // reposition the box when it gets ouf of bounds
  //
  const isWithinBounds = useMemo(() => {
    const { x, z } = position;
    const valid_x = MIN_X <= x && x <= MAX_X;
    const valid_y = MIN_Y <= z && z <= MAX_Y;
    //
    return valid_x && valid_y;
  }, [position, MIN_X, MAX_X, MIN_Y, MAX_Y]);
  //
  useEffect(() => {
    if (!isWithinBounds) setPosition(startPosition);
  }, [isWithinBounds, setPosition]);
  //
  return useMemo(
    () => ({
      x,
      y,
      z,
      areaScale,
      isWithinBounds,
      onJump,
    }),
    [x, y, z, areaScale, isWithinBounds, onJump]
  );
};

export default useAppController;
