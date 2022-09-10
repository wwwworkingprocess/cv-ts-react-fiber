import { useRef } from "react";
import { useFullscreen } from "rooks";
import styled from "styled-components";
import HeightMapRandomApp3D from "../../../fiber-apps/heightmap-random/heightmap-random-app-3d";

const RandomHeightmapDemoWrapper = styled.div`
  max-width: 600px;
  height: 400px;
  margin: auto;
  border: solid 1px black;
`;

const RandomHeightmapDemo = () => {
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const { isFullscreenAvailable, isFullscreenEnabled, toggleFullscreen } =
    useFullscreen({ target: fullscreenContainerRef });
  //
  //
  return (
    <RandomHeightmapDemoWrapper ref={fullscreenContainerRef}>
      <HeightMapRandomApp3D
        isFullscreenAvailable={isFullscreenAvailable}
        isFullscreenEnabled={isFullscreenEnabled}
        toggleFullscreen={toggleFullscreen}
      />
    </RandomHeightmapDemoWrapper>
  );
};

export default RandomHeightmapDemo;
