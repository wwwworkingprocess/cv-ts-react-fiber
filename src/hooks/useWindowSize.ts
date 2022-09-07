import { useEffect, useMemo, useState } from "react";

interface Size {
  width: number;
  height: number;
}

//
//
//
const useWindowSize = (): {
  isPortrait: boolean;
  windowSize: Size;
  screenSizeName: string;
} => {
  const [windowSize, setWindowSize] = useState<Size>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  //
  //
  //
  const screenSizeName = useMemo(() => {
    if (windowSize) {
      //const side = Math.max(windowSize.width, windowSize.height); // ignore orientation
      const side = Math.max(1, windowSize.width);
      //
      return side < 468
        ? "mini"
        : side < 767
        ? "small"
        : side < 991
        ? "normal"
        : side < 1920
        ? "large"
        : "extra";
    }
    //
    return "normal";
  }, [windowSize]);

  //
  //
  //
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    //
    window.addEventListener("resize", handleResize);
    //
    handleResize();
    //
    return () => window.removeEventListener("resize", handleResize);
  }, []); // empty array ensures that effect is only run on mount

  //
  //
  //
  const m = useMemo(() => {
    const isPortrait = windowSize.height > windowSize.width;
    return {
      isPortrait,
      windowSize,
      screenSizeName,
    };
  }, [windowSize, screenSizeName]);
  //
  return m;
};

export default useWindowSize;
