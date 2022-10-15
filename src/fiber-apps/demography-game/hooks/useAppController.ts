import { useCallback, useEffect, useMemo } from "react";

import { Vector3 } from "three";

import useCursorAppStore from "../stores/useGameAppStore";

const startPosition = { x: -17, y: 0, z: 45 };

const useAppController = () => {
  const bounds = useCursorAppStore((state) => state.bounds);
  const position = useCursorAppStore((state) => state.position);
  const setPosition = useCursorAppStore((state) => state.setPosition);
  const decreasePositionY = useCursorAppStore(
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
  // debug: jump on start
  //

  // useEffect(() => {
  //   const t = setTimeout(onJump, 1000);
  //   //
  //   return clearTimeout(t);
  // }, [bounds]);
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
