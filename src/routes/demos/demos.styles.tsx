import styled from "styled-components";

export const DemoList = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: auto;
`;

export const DemoWrapper = styled.div`
  width: 30%;
  padding-bottom: 20px;
  max-width: 330px;
  margin: 10px;

  @media screen and (max-width: 800px) {
    width: 45%;
    margin: 5px;
  }

  img {
    width: 100%;
    height: auto;
  }
`;
