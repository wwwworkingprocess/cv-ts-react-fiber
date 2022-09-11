import { useCallback, useEffect } from "react";

const useKeyboardNavigation = (props: {
  bounds: [number, number, number, number];
  setPosition: React.Dispatch<
    React.SetStateAction<{ x: number; y: number; z: number }>
  >;
}) => {
  const { bounds, setPosition } = props;
  const [MIN_X, MAX_X, MIN_Y, MAX_Y] = bounds;
  //
  // interact with the box via the keyboard
  //
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const handled = [
        "ArrowLeft",
        "ArrowUp",
        "ArrowDown",
        "ArrowRight",
        "Space",
      ];
      //
      if (handled.includes(e.code)) {
        switch (e.code) {
          case "ArrowLeft":
            setPosition((p) => ({ ...p, x: Math.max(p.x - 1, MIN_X) }));
            break;
          case "ArrowRight":
            setPosition((p) => ({ ...p, x: Math.min(p.x + 1, MAX_X) }));
            break;
          case "ArrowUp":
            setPosition((p) => ({ ...p, z: Math.max(p.z - 1, MIN_Y) }));
            break;
          case "ArrowDown":
            setPosition((p) => ({ ...p, z: Math.min(p.z + 1, MAX_Y) }));
            break;
          case "Space":
            setPosition((p) => ({ ...p, y: p.y + 1 }));
            setTimeout(
              () => setPosition((p) => ({ ...p, y: Math.max(p.y - 1, 0) })),
              500
            );
            break;
        }
      }
      //
      // finally prevent window scroll on small screens
      //
      e.preventDefault();
    },
    [MIN_X, MAX_X, MIN_Y, MAX_Y, setPosition]
  );
  //
  // (re)attach keydown handler, whenever (area) bounds changes
  //
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    //
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
  //
  return { bounds };
};

export default useKeyboardNavigation;
