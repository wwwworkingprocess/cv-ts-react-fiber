import { useEffect } from "react";
import { Route, Routes, useNavigate, NavLink } from "react-router-dom";

import { getFirestoreCollection } from "../../utils/firebase/firestore";

import CursorNavigationDemo from "./demo/cursor-navigation.demo";
import GlobeDemo from "./demo/globe.demo";
import HungaryDemo from "./demo/hungary.demo";
import RandomHeightmapDemo from "./demo/random-heightmap.demo";
import WikiCountryDemo from "./demo/wiki-country.demo";
import { DemoList, DemoWrapper } from "./demos.styles";

// import NavigateDemo from "./demo/navigate.demo";
// import ShapeLoaderDemo from "./demo/shape-loader.demo";

type UserDocType = {
  displayName: string | null;
  email: string | null;
  createdAt: Date;
};

type Demo = { idx: number; name: string; git: string; path: string };

const demos = [
  {
    idx: 0,
    git: "wiki-country",
    path: "wiki-countries",
    name: "Wiki Countries",
  },
  {
    idx: 1,
    git: "cursor-navigation",
    path: "cursor-navigation",
    name: "Cursor movement",
  },
  {
    idx: 2,
    git: "hungary",
    path: "hungarian-cities",
    name: "Hungarian Settlements",
  },
  { idx: 3, git: "globe", path: "globe-3d", name: "Globe with Countries" },
  {
    idx: 4,
    git: "heightmap-random",
    path: "hgt-elevation",
    name: "Heightmap Tile Viewer",
  },
] as Array<Demo>;

const GITHUB_ROOT =
  "https://github.com/wwwworkingprocess/cv-ts-react-fiber/tree/main/src/fiber-apps";

const DemoPreview = () => (
  <>
    <h2>Fiber micro-applications</h2>
    <DemoList>
      {demos.map((b, idx) => (
        <DemoWrapper key={idx}>
          <NavLink
            to={`${b.path}`}
            style={{ width: "20%", padding: "5px", color: "white" }}
          >
            {b.name}
            <img src={`img/demo/${b.path}.600x400.png`} alt={b.name} />
          </NavLink>
          <div style={{ textAlign: "right", paddingRight: "2px" }}>
            <a
              href={`${GITHUB_ROOT}/${b.git}`}
              target={"_blank"}
              title={"Check source"}
              rel="noreferrer"
            >
              <small style={{ color: "#444444" }}>Open source</small>
            </a>
          </div>
        </DemoWrapper>
      ))}
    </DemoList>
    <h2>Next Feature in Development</h2>
    <NavLink to={"../../map"}>Wiki demography</NavLink>
  </>
);

const Demos = () => {
  const navigate = useNavigate();
  const basePath = "../../";
  //
  /*
  useEffect(() => {
    const queryUsers = async () => {
      const users = await getFirestoreCollection<UserDocType>("users");
      //
      console.log("snap u", users.length);
    };
    //
    queryUsers();
  }, []);
  */
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
