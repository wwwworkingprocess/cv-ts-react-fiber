import styled from "styled-components";

type WrapToLeftProps = { width: number };

export const WrapToLeft = styled.div<WrapToLeftProps>`
  position: relative;
  top: -345px;
  left: 5px;
  height: 0px;
  userselect: none;
  ${({ width }) => ({ width: `${width}px` })}
`;

export const WrapToRight = styled.div`
  float: right;
  position: relative;
  height: 14px;
  top: -345px;
  right: 5px;
  userselect: none;
`;

export const WrapToBottomLeft = styled.div`
  position: relative;
  top: -24px;
  left: 5px;
  display: inline-block;
  userselect: none;
`;

export const CloseWrap = styled.div`
  clear: both;
`;

export const LastTakenPlace = styled.div`
  width: 120px;
  margin: auto;
  overflow: hidden;
  margin-top: 3px;
  max-height: 250px;

  img {
    width: 100%;
    cursor: pointer;
  }
`;
