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

  small {
    display: inline-block;
    width: 40px;
    margin-right: 4px;
    padding-left: 4px;

    @media screen and (max-width: 400px) {
      zoom: 0.8;
      position: relative;
      top: -2px;
    }
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

  span {
    float: right;
    position: relative;
    top: -2px;
  }
`;
