import { useRef } from "react";
import { useFullscreen } from "rooks";

import styled from "styled-components";

import GlobeApp3D from "../../../fiber-apps/globe/globe-app-3d";

const GlobeDemoWrapper = styled.div`
  max-width: 600px;
  height: 400px;
  margin: auto;
  border: solid 1px black;
`;

const GlobeDemo = ({ path }: { path?: string | undefined }) => {
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  //
  const { isFullscreenAvailable, isFullscreenEnabled, toggleFullscreen } =
    useFullscreen({ target: fullscreenContainerRef });
  //
  return (
    <GlobeDemoWrapper ref={fullscreenContainerRef}>
      {isFullscreenAvailable && (
        <button onClick={toggleFullscreen}>
          {isFullscreenEnabled ? "Disable fullscreen" : "Enable fullscreen"}
        </button>
      )}
      <GlobeApp3D path={path} />
    </GlobeDemoWrapper>
  );
};

export default GlobeDemo;
