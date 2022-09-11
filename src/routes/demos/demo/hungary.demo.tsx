import { useState } from "react";
import { NavigateFunction } from "react-router-dom";
import styled from "styled-components";
import HungaryApp3D from "../../../fiber-apps/hungary/hungary-app-3d";

const HungaryDemoWrapper = styled.div`
  max-width: 600px;
  height: 400px;
  margin: auto;
  border: solid 1px black;
`;

const HungaryDemo = (props: {
  navigate: NavigateFunction;
  path?: string | undefined;
}) => {
  const [minPop, setMinPop] = useState<number>(5000);
  const [maxPop, setMaxPop] = useState<number>(1000000);
  const [themeId, setThemeId] = useState<number>(
    Math.floor(Math.random() * 100)
  );

  return (
    <HungaryDemoWrapper>
      Theme:{" "}
      <input
        type="number"
        min={0}
        step={1}
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
          maxWidth: "700px",
          height: "400px",
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
    </HungaryDemoWrapper>
  );
};

export default HungaryDemo;
