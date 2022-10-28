import { useCallback, useEffect, useMemo } from "react";

import { Vector3 } from "three";

import useGameAppStore from "../stores/useGameAppStore";

const startPosition = { x: -17, y: 0, z: 45 };

const useAppController = () => {
  const bounds = useGameAppStore((state) => state.bounds);
  const position = useGameAppStore((state) => state.position);
  const setPosition = useGameAppStore((state) => state.setPosition);
  const decreasePositionY = useGameAppStore((state) => state.decreasePositionY);
  //
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
