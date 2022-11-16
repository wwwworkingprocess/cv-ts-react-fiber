import { lazy } from "react";

import { Route, Routes } from "react-router-dom";

const GameLandingPage = lazy(() => import("./game-landing-page.component"));
const GameInCountry = lazy(() => import("./game-in-country.component"));

const Map = () => {
  const path = "../";
  const pathInCountry = "../../";

  return (
    <>
      <Routes>
        {/* Country selection page */}
        <Route index element={<GameLandingPage />} />

        {/* Game starts, only country selected */}
        <Route path="/:code" element={<GameInCountry path={path} />} />

        {/* Game starts, country and settlement selected */}
        <Route
          path="/:code/:selectedCode"
          element={<GameInCountry path={pathInCountry} />}
        />
      </Routes>
    </>
  );
};

export default Map;
