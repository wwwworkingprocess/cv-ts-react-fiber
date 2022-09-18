import { useState, useMemo } from "react";

//
// Tracking mouse movement on a specific DOM element
// Position is relative to the caller element, not the window
// use <Canvas {...bind} /> after the hook is called to attach to the DOM
//
const useMousePosition = () => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  //
  const bind = useMemo(
    () => ({
      onMouseMove: (event: React.MouseEvent) => {
        const { offsetX, offsetY } = event.nativeEvent;
        //
        setX(offsetX);
        setY(offsetY);
      },
    }),
    []
  );

  return [x, y, bind] as [
    number,
    number,
    { onMouseMove: (event: React.MouseEvent) => void }
  ];
};

export default useMousePosition;
