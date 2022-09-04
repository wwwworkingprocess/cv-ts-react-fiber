import { NavigateFunction } from "react-router-dom";
import styled from "styled-components";
import ShapeLoaderApp3D from "../../../fiber-apps/shape-loader/shape-loader-app-3d";

const ShapeLoaderDemoWrapper = styled.div`
  max-width: 600px;
  height: 400px;
  margin: auto;
  border: solid 1px black;
`;

const ShapeLoaderDemo = (props: {
  navigate: NavigateFunction;
  path?: string | undefined;
}) => {
  const { navigate, path } = props;
  //
  console.log("shape loader");

  return (
    <ShapeLoaderDemoWrapper>
      <ShapeLoaderApp3D navigate={navigate} path={path} />
    </ShapeLoaderDemoWrapper>
  );
};

export default ShapeLoaderDemo;
