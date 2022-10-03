import styled from "styled-components";

type TSvg = { width: number; height: number };

type StyledSvgCanvasProps = { isMobile: boolean };
type SvgCanvasContainerProps = { isMobile: boolean };

export const SvgCanvas = styled.svg.attrs<TSvg>((props) => ({
  viewBox: `0 0 ` + props.width + ` ` + props.height,
  preserveAspectRatio: `xMidYMid meet`,
  width: props.width,
  height: props.height,
}))``;

export const SvgCanvasContainer = styled.div<SvgCanvasContainerProps>`
  margin: auto;
  ${({ isMobile }) => (isMobile ? { width: `100%` } : { width: `80vw` })}
`;

export const StyledSvgCanvas = styled(SvgCanvas)<StyledSvgCanvasProps>`
  border: solid 1px silver;
  margin: auto;
  width: 100%;

  ${({ isMobile }) => (isMobile ? { zoom: `0.5` } : { zoom: `1` })}
`;

export const Path = styled.path`
  cursor: pointer;
  fill: #fff;
  stroke: #ccc;
  :hover {
    fill: #ada;
  }
  :active {
    opacity: 0.8;
  }
`;
