import styled from "styled-components";

type CourseOverviewGraphProps = { width?: number };

export const CourseOverviewGraph = styled.div<CourseOverviewGraphProps>`
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
