import styled from "styled-components";

type MiniMapImageProps = {
  width?: number;
  height?: number;
};

type MiniMapCrossHairProps = {
  width?: number;
  height?: number;
  top?: number;
  left?: number;
};

export const MiniMapContainer = styled.div``;

export const MiniMapImage = styled.img<MiniMapImageProps>`
  ${({ width }) => width && { width: `${width || 180}px` }}
  ${({ height }) => height && { height: `${height || 90}px` }}
`;

export const MiniMapCrosshair = styled.div<MiniMapCrossHairProps>`
  position: relative;
  border: solid 1px red;
  ${({ width }) => width && { width: `${width || 10}px` }}
  ${({ height }) => height && { height: `${height || 10}px` }}
  ${({ top }) => top && { top: `${top || 0}px` }}
  ${({ left }) => left && { left: `${left || 0}px` }}
`;
