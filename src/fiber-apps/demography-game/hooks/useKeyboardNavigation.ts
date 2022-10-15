import { useCallback, useEffect } from "react";

import useCursorAppStore from "../stores/useGameAppStore";

const handled = ["ArrowLeft", "ArrowUp", "ArrowDown", "ArrowRight", "Space"];

const useKeyboardNavigation = () => {
  const bounds = useCursorAppStore((state) => state.bounds);
  const [MIN_X, MAX_X, MIN_Y, MAX_Y] = bounds;
  //
  const position = useCursorAppStore((state) => state.position);
  const setPosition = useCursorAppStore((state) => state.setPosition);
  const decreasePositionY = useCursorAppStore(
    (state) => state.decreasePositionY
  );
  //
  // interact with the box via the keyboard
  //
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      //
      if (handled.includes(e.code)) {
        const p = position;
        let unhandled = false;
        //
        switch (e.code) {
          case "ArrowLeft":
            setPosition({ ...p, x: Math.max(p.x - 1, MIN_X) });
            break;
          case "ArrowRight":
            setPosition({ ...p, x: Math.min(p.x + 1, MAX_X) });
            break;
          case "ArrowUp":
            setPosition({ ...p, z: Math.min(p.z + 1, MAX_Y) });
            break;
          case "ArrowDown":
            setPosition({ ...p, z: Math.max(p.z - 1, MIN_Y) });
            break;
          case "Space":
            setPosition({ ...p, y: p.y + 1 });
            decreasePositionY(500);
            break;
          default:
            unhandled = true;
            break;
        }
        //
        if (!unhandled) e.preventDefault(); // finally prevent window scroll on small screens
      }
    },
    [MIN_X, MAX_X, MIN_Y, MAX_Y, setPosition, position, decreasePositionY]
  );
  //
  // (re)attach keydown handler, whenever (area) bounds changes
  //
  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    //
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);
  //
  return { bounds };
};

export default useKeyboardNavigation;
