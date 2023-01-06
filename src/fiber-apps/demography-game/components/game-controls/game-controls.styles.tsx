import styled from "styled-components";

type WrapToLeftProps = { width: number; shiftTop?: number };
type WrapToRightProps = { shiftTop?: number };

export const WrapToLeft = styled.div<WrapToLeftProps>`
  position: relative;
  left: 5px;
  height: 0px;
  userselect: none;
  ${({ width }) => ({ width: `${width}px` })}
  ${({ shiftTop }) => shiftTop && { top: `${-1 * (shiftTop - 5)}px` }}
`;

export const WrapToRight = styled.div<WrapToRightProps>`
  float: right;
  position: relative;
  height: 14px;
  right: 5px;
  userselect: none;
  ${({ shiftTop }) => shiftTop && { top: `${-1 * (shiftTop - 5)}px` }}
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
