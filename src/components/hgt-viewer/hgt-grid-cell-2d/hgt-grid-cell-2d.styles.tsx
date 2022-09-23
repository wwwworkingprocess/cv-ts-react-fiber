import styled from "styled-components";

type HgtGridCellBackgroundProps = { width?: number };
type HgtGridCellForegroundProps = { width?: number; height?: number };

export const HgtGridCellBackground = styled.div<HgtGridCellBackgroundProps>`
  position: relative;
  height: 0px;
  ${({ width }) => width && { width: `${width || 150}px` }}
`;
export const HgtGridCellForeground = styled.div<HgtGridCellForegroundProps>`
  position: absolute;
  text-align: center;
  ${({ width }) => width && { width: `${width || 150}px` }}
  ${({ height }) => height && { height: `${height || 150}px` }}

  h5 {
    margin-top: 4px;
    font-size: 11px;
  }

  div {
    margin-top: 100px;
    font-size: 14px;
  }
`;
