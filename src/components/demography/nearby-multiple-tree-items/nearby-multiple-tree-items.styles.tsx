import styled from "styled-components";

type CenterPointProps = { maxWidth: string };

export const CenterPoints = styled.div`
  display: flex;
  max-width: 400px;
  flex-wrap: wrap;
`;

export const CenterPoint = styled.span<CenterPointProps>`
  padding: 4px;
  border: solid 1px rgba(255, 255, 255, 0.3);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  margin-right: 3px;

  ${({ maxWidth }) => ({
    maxWidth: `${maxWidth}`,
  })}
`;
