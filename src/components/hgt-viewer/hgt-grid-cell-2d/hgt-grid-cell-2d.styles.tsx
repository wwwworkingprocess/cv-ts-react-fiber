import styled from "styled-components";

type HgtGridCellBackgroundProps = { width?: number };
type HgtGridCellForegroundProps = { width?: number; height?: number };

export const HgtGridCellBackground = styled.div<HgtGridCellBackgroundProps>`
  position: relative;
  height: 0px;
  ${({ width }) =>
    width !== undefined ? { width: `${width}px` } : { width: `150px` }}
`;
export const HgtGridCellForeground = styled.div<HgtGridCellForegroundProps>`
  position: absolute;
  text-align: center;
  ${({ width }) =>
    width !== undefined ? { width: `${width}px` } : { width: `150px` }}
  ${({ height }) =>
    height !== undefined ? { height: `${height}px` } : { height: `150px` }}

  h5 {
    margin-top: 4px;
    font-size: 11px;
  }

  div {
    margin-top: 100px;
    font-size: 14px;
  }
`;
