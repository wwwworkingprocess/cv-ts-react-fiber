import styled from "styled-components";

export const CompletedCourseContainer = styled.div`
  width: 22vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  img {
    width: 100%;
    height: 95%;
    object-fit: cover;
    margin-bottom: 5px;
  }

  button {
    width: 80%;
    opacity: 0.7;
    position: absolute;
    top: 255px;
    display: none;
  }

  &:hover {
    img {
      opacity: 0.8;
    }

    button {
      opacity: 0.85;
      display: flex;
    }
  }

  @media screen and (max-width: 800px) {
    width: 40vw;

    &:hover {
      img {
        opacity: unset;
      }

      button {
        opacity: unset;
      }
    }
  }
`;

export const Footer = styled.div`
  width: 100%;
  height: 10%;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
`;

export const Name = styled.span`
  width: 90%;
  margin: auto;
  text-align: center;
  margin-bottom: 15px;
`;

export const Lectures = styled.span`
  position: absolute;
  width: 100%;
  text-align: right;
  padding: 8px;
  font-size: 11px;
`;
