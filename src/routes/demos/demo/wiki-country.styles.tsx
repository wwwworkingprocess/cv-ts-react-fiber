import styled from "styled-components";

export const WikiCountryDemoWrapper = styled.div`
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

  b {
    position: relative;
    float: right;
    padding: 4px;
    font-size: 14px;
    color: white;
    top: 66px;
    opacity: 0.7;
    filter: drop-shadow(1px 3px 4px #000000);
  }

  small {
    position: absolute;
    font-size: 10px;
    padding-left: 20px;
    padding-top: 2px;
    margin: 4px;
    color: white;
    opacity: 0.7;
    filter: drop-shadow(1px 3px 4px #000000);
  }
`;

export const CountryItemContainer = styled.div`
  display: flex;
  margin: 5px;
  width: 120px;
  height: 90px;
`;

export const CountryItemBody = styled.div`
  height: 40px;
  margin-top: 25px;
  width: 120px;
  overflow: hidden;
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
    margin: 4px 6px 0;
    font-size: 14px;
    white-space: nowrap;

    color: #4a4a4a;
    text-transform: uppercase;
  }

  span {
    font-weight: lighter;
    font-size: 12px;
    color: black;
    white-space: nowrap;
  }
`;
