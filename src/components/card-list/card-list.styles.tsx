import styled from "styled-components";

export const CardListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 0.9fr);
  grid-gap: 0.3vw;
  padding: auto;
  align-self: center;

  & > div {
    margin-bottom: 30px;
    border: solid 1px red;
  }

  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr 1fr;
    grid-gap: 15px;
  }
`;
