import React, { lazy, Suspense } from "react";

import { Route, Routes } from "react-router-dom";

import "./App.css";

import Navigation from "./components/navigation/navigation.component";
import { Spinner } from "./components/spinner/spinner.component";

import useLocalStorage from "./hooks/useLocalStorage";

import GlobalStyle from "./global.styles";
import { useFullscreen } from "rooks";
import { isMobile } from "react-device-detect";

//
// lazy loading main routes
//
const Home = lazy(() => import("./routes/home/home.component"));
const Courses = lazy(() => import("./routes/courses/courses.component"));
const Map = lazy(() => import("./routes/map/map.component"));
const Demos = lazy(() => import("./routes/demos/demos.component"));
const Authentication = lazy(
  () => import("./routes/authentication/authentication.component")
);

const PageFrame = () => {
  const [theme] = useLocalStorage("theme", "dark");
  //

  const { isFullscreenAvailable, isFullscreenEnabled, toggleFullscreen } =
    useFullscreen();
  //
  console.log("page using theme", theme);
  //
  return (
    <>
      {isFullscreenAvailable && (
        <button
          onClick={toggleFullscreen}
          style={{ position: "absolute", top: "40px", fontSize: "10px" }}
        >
          {isFullscreenEnabled ? "Fullscreen" : "Fullscreen off"}
          {isMobile ? "(M)" : "(D)"}
        </button>
      )}
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<Navigation />}>
          <Route index element={<Home />} />

          <Route path="courses/*" element={<Courses />} />

          <Route path="map" element={<Map />} />
          <Route path="demos" element={<Demos />} />

          <Route path="auth" element={<Authentication />} />
        </Route>
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <PageFrame />
    </Suspense>
  );
};

export default App;
