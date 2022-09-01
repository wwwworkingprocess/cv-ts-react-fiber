import { useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import styled from "styled-components";
import CursorNavigationDemo3D from "../../fiber-apps/cursor-navigation/cursor-navigation-3d";

import GlobeApp3D from "../../fiber-apps/globe/globe-app-3d";
import HeightMapRandomApp3D from "../../fiber-apps/heightmap-random/heightmap-random-app-3d";
import HungaryApp3D from "../../fiber-apps/hungary/hungary-app-3d";
import NavigateApp3D from "../../fiber-apps/navigate/navigate-app-3d";

// import RangeControl from "./range.component";

const RandomHeightmapDemo = () => (
  <>
    <div
      style={{
        width: "600px",
        height: "400px",
        margin: "auto",
        border: "solid 1px black",
      }}
    >
      <HeightMapRandomApp3D />
    </div>
  </>
);

const GlobeDemo = () => (
  <>
    <div
      style={{
        width: "600px",
        height: "400px",
        margin: "auto",
        border: "solid 1px black",
      }}
    >
      <GlobeApp3D />
    </div>
  </>
);

const HungaryDemo = (props: {
  navigate: NavigateFunction;
  path?: string | undefined;
}) => {
  const [minPop, setMinPop] = useState<number>(100);
  const [maxPop, setMaxPop] = useState<number>(1000000);
  const [themeId, setThemeId] = useState<number>(
    Math.floor(Math.random() * 100)
  );

  return (
    <>
      Theme:{" "}
      <input
        type="number"
        min={0}
        max={100}
        value={themeId}
        onChange={(e) => setThemeId(parseInt(e.target.value))}
      />
      <br />
      Population:{" "}
      <input
        type="number"
        min={0}
        max={1000000}
        value={minPop}
        onChange={(e) => setMinPop(parseInt(e.target.value))}
      />
      <input
        type="number"
        min={0}
        max={1000000}
        value={maxPop}
        onChange={(e) => setMaxPop(parseInt(e.target.value))}
      />{" "}
      [{minPop}..{maxPop}] [{minPop}..{maxPop}]
      {/* <RangeControl setMinPop={setMinPop} setMaxPop={setMaxPop} /> */}
      <div
        style={{
          width: "900px",
          height: "600px",
          margin: "auto",
          border: "solid 1px black",
        }}
      >
        <HungaryApp3D
          navigate={props.navigate}
          path={".."}
          minPop={minPop}
          maxPop={maxPop}
          themeId={themeId}
        />
      </div>
    </>
  );
};

const CursorNavigationDemoWrapper = styled.div`
  width: 600px;
  height: 400px;
  margin: auto;
  border: solid 1px black;
`;
const CursorNavigationControls = styled.div`
  width: 350px;
  margin: auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
`;
const CursorNavigationDemoControlButton = styled.button`
  padding: 3px;
  margin: 5px;
`;

const CursorNavigationDemo = (props: { path?: string | undefined }) => {
  const [bounds, setBounds] = useState<[number, number, number, number]>([
    -3, 3, -2, 2,
  ]);

  const [cameraEnabled, setCameraEnabled] = useState<boolean>(false);

  return (
    <>
      <CursorNavigationControls>
        <CursorNavigationDemoControlButton
          onClick={(e) => setCameraEnabled((b) => !b)}
        >
          {!cameraEnabled ? "Enable cam." : "Disable cam."}
        </CursorNavigationDemoControlButton>
        <CursorNavigationDemoControlButton
          onClick={(e) => setBounds([-2, 2, -1, 1])}
        >
          5x3
        </CursorNavigationDemoControlButton>
        <CursorNavigationDemoControlButton
          onClick={(e) => setBounds([-3, 3, -2, 2])}
        >
          7x5
        </CursorNavigationDemoControlButton>
        <CursorNavigationDemoControlButton
          onClick={(e) => setBounds([-5, 5, -5, 5])}
        >
          11x11
        </CursorNavigationDemoControlButton>
      </CursorNavigationControls>
      <CursorNavigationDemoWrapper>
        <CursorNavigationDemo3D
          path={props.path}
          bounds={bounds}
          isCameraEnabled={cameraEnabled}
        />
      </CursorNavigationDemoWrapper>
    </>
  );
};

const Demos = () => {
  const navigate = useNavigate();
  //
  const [index, setIndex] = useState<number>(0);
  //
  return (
    <div>
      Demos
      <hr />
      <button onClick={(e) => setIndex(1)}>Navigate app</button>
      <button onClick={(e) => setIndex(2)}>Random heightmap app</button>
      <button onClick={(e) => setIndex(3)}>Globe 3D app</button>
      <button onClick={(e) => setIndex(4)}>Hungary app</button>
      <button onClick={(e) => setIndex(5)}>Cursor move app</button>
      <hr />
      {index === 0 ? (
        <>Please select a demo</>
      ) : index === 1 ? (
        <div
          style={{
            width: "600px",
            height: "400px",
            margin: "auto",
            border: "solid 1px black",
          }}
        >
          <NavigateApp3D navigate={navigate} path={"../"} />
        </div>
      ) : index === 2 ? (
        <RandomHeightmapDemo />
      ) : index === 3 ? (
        <GlobeDemo />
      ) : index === 4 ? (
        <HungaryDemo navigate={navigate} path={"../"} />
      ) : index === 5 ? (
        <CursorNavigationDemo path={"../"} />
      ) : (
        ""
      )}
    </div>

    // <AuthenticationContainer>
    //   <SignInForm />
    //   <SignUpForm />
    // </AuthenticationContainer>
  );
};

export default Demos;
