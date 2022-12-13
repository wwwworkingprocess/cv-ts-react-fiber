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

export const Footer = styled.div`
  text-align: center;
  font-size: 12px;
  padding: 20px;
`;
