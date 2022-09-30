import styled from "styled-components";

export const LinkedInBadgesContainer = styled.div`
  align-items: center;
  display: flex;
  margin: auto;
  flex-wrap: wrap;
`;

export const LinkedInBadge = styled.div`
  flex-grow: 1;
  max-width: 30%;
  height: 55px;
  padding: 5px;
  margin: 4px;
  text-align: center;
  border: solid 1px rgba(255, 255, 255, 0.15);

  span {
    line-height: 35px;
    font-size: 13px;
  }
`;
