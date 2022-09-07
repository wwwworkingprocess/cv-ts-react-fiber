import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import CursorNavigationDemo from "./demo/cursor-navigation.demo";
import GlobeDemo from "./demo/globe.demo";
import HungaryDemo from "./demo/hungary.demo";
import NavigateDemo from "./demo/navigate.demo";
import RandomHeightmapDemo from "./demo/random-heightmap.demo";
import ShapeLoaderDemo from "./demo/shape-loader.demo";
import WikiCountryDemo from "./demo/wiki-country.demo";

// import RangeControl from "./range.component";

type Demo = { idx: number; name: string; element?: JSX.Element };

const Demos = () => {
  const navigate = useNavigate();
  //
  const [index, setIndex] = useState<number>(0);
  //
  const demos = useMemo(() => {
    return [
      {
        idx: 0,
        name: "Shape loader app",
        element: <ShapeLoaderDemo navigate={navigate} path={"../"} />,
      },
      {
        idx: 1,
        name: "Navigate app",
        element: <NavigateDemo navigate={navigate} path={"../"} />,
      },
      {
        idx: 2,
        name: "Random heightmap app",
        element: <RandomHeightmapDemo />,
      },
      {
        idx: 3,
        name: "Globe 3D app",
        element: <GlobeDemo />,
      },
      {
        idx: 4,
        name: "Hungary app",
        element: <HungaryDemo navigate={navigate} path={"../"} />,
      },
      {
        idx: 5,
        name: "Cursor move app",
        element: <CursorNavigationDemo path={"../"} />,
      },
      {
        idx: 6,
        name: "Wiki Country app",
        element: <WikiCountryDemo navigate={navigate} path={"../"} />,
      },
    ].reverse() as Array<Demo>;
  }, [navigate]);
  //
  const currentDemo = useMemo(() => demos[index || 0], [demos, index]);

  //
  return (
    <>
      Demos
      <hr />
      {demos.map((b) => (
        <button key={b.idx} onClick={(e) => setIndex(b.idx)}>
          {b.name}
        </button>
      ))}
      <hr />
      {currentDemo ? currentDemo.element : undefined}
    </>
  );
};

export default Demos;
