import { useState } from "react";
import styled from "styled-components";

import CursorNavigationDemo3D from "../../../fiber-apps/cursor-navigation/cursor-navigation-3d";

const CursorNavigationDemoWrapper = styled.div`
  max-width: 600px;
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

  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);

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
export default CursorNavigationDemo;
