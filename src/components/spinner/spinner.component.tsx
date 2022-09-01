import { SpinnerOverlay, SpinnerContainer } from "./spinner.styles";

export const Spinner = (): JSX.Element => (
  <SpinnerOverlay data-testid="spinner-container">
    <SpinnerContainer></SpinnerContainer>
  </SpinnerOverlay>
);
