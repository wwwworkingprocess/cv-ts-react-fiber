import styled from "styled-components";

type HgtGridColumnsProps = { height?: number };
type HgtGridRowProps = { width?: number };
type HgtGridCellProps = { width?: number; height?: number };

export const HgtGridRow = styled.div<HgtGridRowProps>`
  margin: auto;
  ${({ width }) =>
    width !== undefined ? { width: `${width}px` } : { width: `150px` }}
`;
export const HgtGridColumns = styled.div<HgtGridColumnsProps>`
  clear: both;
  ${({ height }) =>
    height !== undefined ? { height: `${height}px` } : { height: `150px` }}
`;

export const HgtGridCell = styled.div<HgtGridCellProps>`
  float: left;
  user-select: none;
  ${({ width }) =>
    width !== undefined ? { width: `${width}px` } : { width: `150px` }}
  ${({ height }) =>
    height !== undefined ? { height: `${height}px` } : { height: `150px` }}
`;
