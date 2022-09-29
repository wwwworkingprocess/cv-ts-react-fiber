import styled from "styled-components";

export const HgtScrollable2DGrid = styled.div`
  width: 100%;
  overflow: auto;
  padding-bottom: 8px;
  overflow-y: hidden;
  scrollbar-color: rebeccapurple green;
  scrollbar-width: thin;
`;

export const HgtZipContentLayoutGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-width: 720px;
  margin: auto;
`;

export const HgtZipContentLayoutGridCell = styled.div`
  flex-grow: 1;
  width: 30%;
  background-color: black;
  min-width: 120px;
  max-width: 240px;
  height: 120px;
`;

export const HgtZipContentFileDetailsContainer = styled.div`
  padding: 5px;
  overflow: none;
  width: 80%;
  margin: auto;
  line-height: 20px;
  font-size: 14px;
`;
