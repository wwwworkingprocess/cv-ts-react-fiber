import React, { Suspense, useEffect, useState } from "react";

import { Route, Routes } from "react-router-dom";
// import logo from "./logo.svg";

import "./App.css";

import Navigation from "./components/navigation/navigation.component";
import { Spinner } from "./components/spinner/spinner.component";
import GlobalStyle from "./global.styles";

import Home from "./routes/home/home.component";
import Courses from "./routes/courses/courses.component";
import Map from "./routes/map/map.component";
import Demos from "./routes/demos/demos.component";
import Authentication from "./routes/authentication/authentication.component";

import useLocalStorage from "./hooks/useLocalStorage";

export const DataLoadTest = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Array<any> | null>(null);

  const fetchApi = () => {
    fetch("data/course/3792262.json", { mode: "no-cors" })
      //fetch("https://jsonplaceholder.typicode.com/users")
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        console.log(json);
        setLoading(false);
        setData(json);
      });
  };

  useEffect(() => {
    fetchApi();
  }, []);

  if (loading) return <h1>Loading</h1>;

  return (
    <div>
      <h1>Data fetched successfully.</h1>
      {data && data.length} items
    </div>
  );
};

const PageFrame = () => {
  const [theme, setTheme] = useLocalStorage("theme", "dark");

  //
  console.log("page using theme", theme);
  //

  return (
    <>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<Navigation />}>
          <Route index element={<Home />} />
          <Route path="courses/*" element={<Courses />} />
          <Route path="map" element={<Map />} />
          <Route path="demos" element={<Demos />} />
          {/* <Route path="shop/*" element={<Shop />}></Route>
          <Route path="checkout" element={<Checkout />} /> */}
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
