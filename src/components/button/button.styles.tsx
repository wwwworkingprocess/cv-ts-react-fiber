import styled from "styled-components";

import { SpinnerContainer } from "../spinner/spinner.styles";

export const BaseButton = styled.button`
  min-width: 165px;
  width: auto;
  height: 50px;
  letter-spacing: 0.5px;
  line-height: 50px;
  padding: 0 35px 0 35px;
  font-size: 15px;
  background-color: #333333;
  color: white;
  text-transform: uppercase;
  //   font-family: "Open Sans Condensed";
  font-weight: bolder;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    background-color: white;
    color: #333333;
    border: 1px solid #666666;
  }
`;

export const GoogleSignInButton = styled(BaseButton)`
  background-color: #4285f4;
  color: white;

  &:hover {
    background-color: #357ae8;
    border: none;
  }
`;

export const InvertedButton = styled(BaseButton)`
  background-color: white;
  color: black;
  border: 1px solid #333333;

  &:hover {
    background-color: #333333;
    color: white;
    border: none;
  }

  @media screen and (max-width: 800px) {
    display: block;
    padding: 10px;
    opacity: 0.9;
    min-width: unset;
    padding: 0 10px;
  }
`;

export const ButtonSpinner = styled(SpinnerContainer)`
  width: 30px;
  height: 30px;
`;
