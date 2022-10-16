import styled from "styled-components";

export const ControlsContainer = styled.div`
  position: relative;
  z-index: 1000;
  top: 20px;
  display: flex;
  font-size: 2rem;
  user-select: none;

  align-items: center;
  justify-content: right;

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
