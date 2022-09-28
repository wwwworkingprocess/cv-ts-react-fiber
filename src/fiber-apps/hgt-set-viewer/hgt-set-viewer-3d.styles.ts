import styled from "styled-components";

export const SettingsContainer = styled.div`
  position: relative;
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
