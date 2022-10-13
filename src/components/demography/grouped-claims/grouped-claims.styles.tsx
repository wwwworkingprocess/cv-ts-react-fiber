import styled from "styled-components";

type ClaimItemProps = { height: number; minWidth: number; maxWidth: number };

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
