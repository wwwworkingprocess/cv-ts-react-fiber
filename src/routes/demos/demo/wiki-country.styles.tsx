import styled from "styled-components";

export const WikiCountryDemoWrapper = styled.div`
  max-width: 600px;
  height: 400px;
  margin: auto;
  border: solid 1px black;
`;

export const CountryListContainer = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

export const BackgroundImage = styled.div`
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-image: ${({ imageUrl }: { imageUrl: string }) =>
    `url(${imageUrl})`};
`;

export const CountryItemContainer = styled.div`
  display: flex;
  border: solid 1px gold;
  width: 120px;
  height: 90px;
  alignitems: center;
`;

export const CountryItemBody = styled.div`
  height: 60px;
  width: 120px;
  padding: 0 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid black;
  background-color: white;
  opacity: 0.7;
  position: absolute;

  h2 {
    font-weight: bold;
    margin: 0 6px 0;
    font-size: 14px;

    color: #4a4a4a;
    text-transform: uppercase;
  }

  span {
    font-weight: lighter;
    font-size: 12px;
    color: black;
  }
`;
