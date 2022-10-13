import styled from "styled-components";

export const AdminOneListContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

export const AdminOneListItem = styled.span`
  flex: 1 1 0px;
  flex-grow: 1;
  text-align: left;
  min-width: 200px;
  max-width: 400px;
  margin: 2px;
  border: 1px solid black;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;
