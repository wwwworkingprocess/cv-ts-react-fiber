import styled from "styled-components";

type HgtSetViewerContainerProps = { isMobile: boolean };

export const HgtSetViewerContainer = styled.div<HgtSetViewerContainerProps>`
  margin: auto;
  ${({ isMobile }) => `height: ${isMobile ? "80vh" : "90vh"};`}
  ${({ isMobile }) => `width: ${isMobile ? "70vw" : "auto"};`};
`;

export const SettingsContainer = styled.div`
  position: relative;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;

  label {
    padding: 2px;
    display: flex;
  }

  input {
    padding: 2px;
    display: flex;
  }
`;

export const ControlsContainer = styled.div`
  position: relative;
  top: -50px;
  display: flex;
  font-size: 2rem;

  align-items: center;
  justify-content: center;

  label {
    background: none;
    border: none;
    font-weight: 600;
    color: palevioletred;
    padding: 0.4rem;
    margin: 0 1rem;
  }

  input {
    background: none;
    border: none;
    font-size: 2rem;

    color: orange;
    margin: 0 1rem;
    width: 60px;
  }
`;

export const JumpButtonContainer = styled.div`
  width: 20%;
`;
export const JumpButton = styled.button`
  width: 70px;
  height: 40px;
  position: relative;
  top: -30px;
  backgroundcolor: rgba(255, 255, 255, 0.55);
`;

export const MobileScrollToTopContainer = styled.div`
  text-align: center;
  padding-top: 10px;
  padding-bottom: 30px;
`;
