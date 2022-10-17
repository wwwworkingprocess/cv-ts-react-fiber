import styled from "styled-components";

export const ActionTabsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  text-align: center;
  float: right;
  max-width: 70vw;
`;

export const ActionTab = styled.div`
  border: 1px solid silver;
  flex-grow: 1;
  padding: 3px;
`;

export const ActionTabSelected = styled.div`
  border: 1px solid gold;
  flex-grow: 1;
  padding: 3px;

  b {
    color: gold;
  }
`;
