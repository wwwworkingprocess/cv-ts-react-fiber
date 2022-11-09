import styled from "styled-components";

export const CityListItem = styled.div`
  display: inline-block;
  font-size: 12px;
  width: 60px;
  text-align: center;
  letter-spacing: 0.6px;

  img {
    width: 40px;
    height: 30px;
    object-fit: cover;
  }

  small {
    position: relative;
    top: -2px;
  }

  div {
    padding: 2px;
    max-width: 80px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
`;
