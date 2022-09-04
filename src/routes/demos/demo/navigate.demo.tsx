import { NavigateFunction } from "react-router-dom";
import styled from "styled-components";
import NavigateApp3D from "../../../fiber-apps/navigate/navigate-app-3d";

const NavigateDemoWrapper = styled.div`
  max-width: 600px;
  height: 400px;
  margin: auto;
  border: solid 1px black;
`;

const NavigateDemo = (props: {
  navigate: NavigateFunction;
  path?: string | undefined;
}) => {
  const { navigate, path } = props;
  //
  return (
    <NavigateDemoWrapper>
      <NavigateApp3D navigate={navigate} path={path} />
    </NavigateDemoWrapper>
  );
};

export default NavigateDemo;
