import styled from "styled-components";
import HeightMapRandomApp3D from "../../../fiber-apps/heightmap-random/heightmap-random-app-3d";

const RandomHeightmapDemoWrapper = styled.div`
  max-width: 600px;
  height: 400px;
  margin: auto;
  border: solid 1px black;
`;

const RandomHeightmapDemo = () => (
  <RandomHeightmapDemoWrapper>
    <HeightMapRandomApp3D />
  </RandomHeightmapDemoWrapper>
);

export default RandomHeightmapDemo;
