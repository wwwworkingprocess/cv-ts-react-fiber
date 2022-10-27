import { Route, Routes, useNavigate, NavLink } from "react-router-dom";

import CursorNavigationDemo from "./demo/cursor-navigation.demo";
import GlobeDemo from "./demo/globe.demo";
import HungaryDemo from "./demo/hungary.demo";
import RandomHeightmapDemo from "./demo/random-heightmap.demo";
import WikiCountryDemo from "./demo/wiki-country.demo";

import availableDemos from "../../assets/json/demo/demo.json";

import { DemoList, DemoWrapper } from "./demos.styles";

type Demo = { idx: number; name: string; git: string; path: string };

const demos = availableDemos.reverse() as Array<Demo>;

const BASE_PATH = "../../";
const GITHUB_ROOT =
  "https://github.com/wwwworkingprocess/cv-ts-react-fiber/tree/main/src/fiber-apps";

//
//
//
const DemoPreview = () => (
  <>
    <h2>Fiber micro-applications</h2>
    <DemoList>
      {demos.map((b, idx) => (
        <DemoWrapper key={b.idx}>
          <NavLink
            to={b.git !== "demography-game" ? `${b.path}` : "../../map"}
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
  </>
);

const Demos = () => {
  //
  const navigate = useNavigate();
  //
  return (
    <Routes>
      <Route index element={<DemoPreview />} />

      <Route
        path="wiki-countries"
        element={<WikiCountryDemo navigate={navigate} path={BASE_PATH} />}
      />
      <Route
        path="cursor-navigation"
        element={<CursorNavigationDemo path={BASE_PATH} />}
      />
      <Route
        path="hungarian-cities"
        element={<HungaryDemo navigate={navigate} path={BASE_PATH} />}
      />
      <Route path="globe-3d" element={<GlobeDemo path={BASE_PATH} />} />
      <Route
        path="hgt-elevation"
        element={<RandomHeightmapDemo path={BASE_PATH} />}
      />
    </Routes>
  );
};

export default Demos;
