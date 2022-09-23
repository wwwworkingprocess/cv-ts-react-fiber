import { lazy, Suspense, useEffect } from "react";
import { useDispatch } from "react-redux";

import { Route, Routes } from "react-router-dom";

import "./App.css";

import Navigation from "./components/navigation/navigation.component";
import { Spinner } from "./components/spinner/spinner.component";

import GlobalStyle from "./global.styles";
import { checkUserSession } from "./store/user/user.action";

//
// lazy loading main routes
//
const Home = lazy(() => import("./routes/home/home.component"));
const Courses = lazy(() => import("./routes/courses/courses.component"));
const Viewer = lazy(() => import("./routes/viewer/viewer.component"));
const Map = lazy(() => import("./routes/map/map.component"));
const Demos = lazy(() => import("./routes/demos/demos.component"));
const Authentication = lazy(
  () => import("./routes/authentication/authentication.component")
);

const PageFrame = () => {
  // const [theme] = useLocalStorage("theme", "dark");
  //
  return (
    <>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<Navigation />}>
          <Route index element={<Home />} />

          <Route path="skills/*" element={<Courses />} />
          <Route path="viewer/*" element={<Viewer />} />

          <Route path="map" element={<Map />} />
          <Route path="demos" element={<Demos />} />

          <Route path="auth" element={<Authentication />} />
        </Route>
      </Routes>
    </>
  );
};

const App = () => {
  const dispatch = useDispatch();
  //
  useEffect(() => {
    dispatch(checkUserSession());
  }, [dispatch]);
  //
  return (
    <Suspense fallback={<Spinner />}>
      <PageFrame />
    </Suspense>
  );
};

export default App;
