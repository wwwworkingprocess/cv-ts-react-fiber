import { useState, useMemo } from "react";

const useMousePosition = () => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const bind = useMemo(
    () => ({
      onMouseMove: (event: React.MouseEvent) => {
        setX(event.nativeEvent.offsetX);
        setY(event.nativeEvent.offsetY);
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
