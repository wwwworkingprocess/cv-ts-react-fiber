import styled from "styled-components";

type HgtGridColumnsProps = { height?: number };
type HgtGridRowProps = { width?: number };
type HgtGridCellProps = { width?: number; height?: number };

export const HgtGridRow = styled.div<HgtGridRowProps>`
  margin: auto;
  ${({ width }) => width && { width: `${width || 150}px` }}
`;
export const HgtGridColumns = styled.div<HgtGridColumnsProps>`
  clear: both;
  ${({ height }) => height && { height: `${height || 150}px` }}
`;

export const HgtGridCell = styled.div<HgtGridCellProps>`
  float: left;
  ${({ width }) => width && { width: `${width || 150}px` }}
  ${({ height }) => height && { height: `${height || 150}px` }}
`;
