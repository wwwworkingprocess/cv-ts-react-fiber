import styled from "styled-components";

export const AdminTwoListContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

export const AdminTwoListItem = styled.span`
  flex: 1 1 0px;
  flex-grow: 1;
  text-align: left;
  min-width: 200px;
  max-width: 400px;
  padding: 1px;
  margin: 2px;
  border: 1px solid black;

  @media screen and (max-width: 600px) {
    min-width: 100%;
    font-size: 80%;
  }

  label {
    max-width: 100px;

    @media screen and (max-width: 400px) {
      display: inline-block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      width: 20%px;
      font-size: 12px;
    }
  }
`;
