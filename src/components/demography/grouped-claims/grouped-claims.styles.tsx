import styled from "styled-components";

type ClaimItemProps = { height: number; minWidth: number; maxWidth: number };
type ClaimItemDialogImageProps = { width: string; height: string };

export const FlexContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: stretch;
`;

export const FlexMediaContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export const ClaimItemMedia = styled.div`
  display: flex;
  max-width: 320px;
  max-height: 320px;
  margin: auto;

  img {
    width: 200px;
    height: auto;
  }

  b {
    position: absolute;
    margin: auto;
    filter: drop-shadow(2px 2px 2px #000000);
  }
`;

export const ClaimItem = styled.div<ClaimItemProps>`
  flex: 1 1 0px;
  flex-grow: 1;
  overflow: hidden;
  margin: 4px;
  border: solid 1px rgba(255, 255, 255, 0.3);
  ${({ height }) => ({ height: `${height}px` })}
  ${({ minWidth }) => ({ minWidth: `${minWidth}px` })}
  ${({ maxWidth }) => ({ maxWidth: `${maxWidth}px` })}

  div {
    ${({ maxWidth }) => ({ maxWidth: `${maxWidth}px` })}
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-decoration: underline;
  }

  label {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    ${({ maxWidth }) => ({ maxWidth: `${maxWidth}px` })}
  }
`;

type ClaimItemMediaDialogFrameProps = { imageFitWidth: boolean };

export const ClaimItemMediaDialogFrame = styled.div<ClaimItemMediaDialogFrameProps>`
  border-radius: 20px;
  max-height: 94vh;
  user-select: none;
  ${({ imageFitWidth }) =>
    imageFitWidth ? { overflowX: `hidden` } : { overflowY: `hidden` }}
`;

export const ClaimItemMediaMoreImages = styled.div`
  height: 100px;
  width: 85%;
  position: fixed;
  top: 32px;
  margin-left: 3px;
  display: flex;

  img {
    filter: drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.8));
    width: auto;
    height: 50px;
    padding-right: 10px;
    cursor: pointer;
  }
`;

export const ClaimItemDialogImageWrap = styled.div`
  display: flex;
  justify-content: center;
`;

export const ClaimItemDialogImage = styled.img<ClaimItemDialogImageProps>`
  ${({ width }) => ({ width: width })}
  ${({ height }) => ({ height: height })};
`;

export const ClaimItemDialogOptionsPanel = styled.div`
  width: 90px;
  position: fixed;
  height: 0px;
  margin: auto;
  text-align: left;
  top: 10px;
  z-index: 1003;

  button {
    cursor: pointer;
  }
`;
