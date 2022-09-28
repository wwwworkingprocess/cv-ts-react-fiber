import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestoreCollection } from "../../utils/firebase/firestore";

import CursorNavigationDemo from "./demo/cursor-navigation.demo";
import GlobeDemo from "./demo/globe.demo";
import HungaryDemo from "./demo/hungary.demo";
import NavigateDemo from "./demo/navigate.demo";
import RandomHeightmapDemo from "./demo/random-heightmap.demo";
import ShapeLoaderDemo from "./demo/shape-loader.demo";
import WikiCountryDemo from "./demo/wiki-country.demo";

type UserDocType = {
  displayName: string | null;
  email: string | null;
  createdAt: Date;
};

type Demo = { idx: number; name: string; element?: JSX.Element };

const Demos = () => {
  const navigate = useNavigate();

  //
  useEffect(() => {
    const queryUsers = async () => {
      const users = await getFirestoreCollection<UserDocType>("users");
      //
      console.log("snap u", users.length);
    };
    //
    queryUsers();
  }, []);

  const [index, setIndex] = useState<number>(0);
  //
  const otherDemos = useMemo(
    () => [
      {
        idx: 1,
        name: "Navigate app",
        element: <NavigateDemo navigate={navigate} path={"../"} />,
      },

      {
        idx: 6,
        name: "Shape loader app",
        element: <ShapeLoaderDemo navigate={navigate} path={"../"} />,
      },
    ],
    [navigate]
  );
  //
  const demos = useMemo(() => {
    return [
      {
        idx: 0,
        name: "Wiki Country app",
        element: <WikiCountryDemo navigate={navigate} path={"../"} />,
      },
      {
        idx: 1,
        name: "Cursor move app",
        element: <CursorNavigationDemo path={"../"} />,
      },
      {
        idx: 2,
        name: "Hungary app",
        element: <HungaryDemo navigate={navigate} path={"../"} />,
      },
      {
        idx: 3,
        name: "Globe 3D app",
        element: <GlobeDemo />,
      },
      {
        idx: 4,
        name: "Heightmap app",
        element: <RandomHeightmapDemo />,
      },
    ] as Array<Demo>;
  }, [navigate]);
  //
  const currentDemo = useMemo(
    () => demos.filter((d) => d.idx === index)[0],
    [demos, index]
  );

  //
  return (
    <>
      Demos
      <hr />
      {demos.map((b) => (
        <button
          key={b.idx}
          onClick={(e) => setIndex(b.idx)}
          style={{ width: "20%", padding: "5px" }}
        >
          {b.name}
        </button>
      ))}
      <hr />
      {currentDemo ? currentDemo.element : undefined}
    </>
  );
};

export default Demos;
