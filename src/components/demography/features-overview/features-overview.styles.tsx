import styled from "styled-components";

type FeaturesOverviewGraphProps = { width?: number };

export const FeaturesOverviewGraph = styled.div<FeaturesOverviewGraphProps>`
display: "flex",
alignItems: "center",
overflowX: "hidden",
margin: "auto",
${({ width }) =>
  width !== undefined ? { width: `${width}px` } : { width: `auto` }}
`;

export const Header = styled.h3`
  text-align: left;
`;
