import { useEffect } from "react";
import { Route, Routes, useNavigate, NavLink } from "react-router-dom";

import { getFirestoreCollection } from "../../utils/firebase/firestore";

import CursorNavigationDemo from "./demo/cursor-navigation.demo";
import GlobeDemo from "./demo/globe.demo";
import HungaryDemo from "./demo/hungary.demo";
import RandomHeightmapDemo from "./demo/random-heightmap.demo";
import WikiCountryDemo from "./demo/wiki-country.demo";

// import NavigateDemo from "./demo/navigate.demo";
// import ShapeLoaderDemo from "./demo/shape-loader.demo";

type UserDocType = {
  displayName: string | null;
  email: string | null;
  createdAt: Date;
};

type Demo = { idx: number; name: string; path: string };

const demos = [
  { idx: 0, path: "wiki-countries", name: "Wiki Country app" },
  { idx: 1, path: "cursor-navigation", name: "Cursor move app" },
  { idx: 2, path: "hungarian-cities", name: "Hungary app" },
  { idx: 3, path: "globe-3d", name: "Globe 3D app" },
  { idx: 4, path: "hgt-elevation", name: "Heightmap app" },
] as Array<Demo>;

// type DemoRouteParams = { demo: string };

const DemoPreview = () => (
  <>
    Demos
    <hr />
    {demos.map((b) => (
      <NavLink
        key={b.idx}
        to={`${b.path}`}
        style={{ width: "20%", padding: "5px", color: "white" }}
      >
        {b.name}
      </NavLink>
    ))}
  </>
);

const Demos = () => {
  const navigate = useNavigate();
  const basePath = "../../";
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
  //
  return (
    <Routes>
      <Route index element={<DemoPreview />} />
      <Route
        path="wiki-countries"
        element={<WikiCountryDemo navigate={navigate} path={basePath} />}
      />
      <Route
        path="cursor-navigation"
        element={<CursorNavigationDemo path={basePath} />}
      />
      <Route
        path="hungarian-cities"
        element={<HungaryDemo navigate={navigate} path={basePath} />}
      />
      <Route path="globe-3d" element={<GlobeDemo path={basePath} />} />
      <Route
        path="hgt-elevation"
        element={<RandomHeightmapDemo path={basePath} />}
      />
    </Routes>
  );
};

export default Demos;
