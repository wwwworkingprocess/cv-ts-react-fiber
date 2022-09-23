import styled from "styled-components";

type MiniMapCrossHairProps = {
  width?: number;
  height?: number;
  top?: number;
  left?: number;
};

export const MiniMapCrosshair = styled.div<MiniMapCrossHairProps>`
  position: relative;
  border: solid 1px red;
  ${({ width }) => width && { width: `${width || 10}px` }}
  ${({ height }) => height && { height: `${height || 10}px` }}
  ${({ top }) => top && { top: `${top || 0}px` }}
  ${({ left }) => left && { left: `${left || 0}px` }}
`;
