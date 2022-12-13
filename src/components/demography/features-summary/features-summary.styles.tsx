import styled from "styled-components";

type SettlementSearchResultsProps = { columns: number };

export const SettlementSearchResults = styled.div<SettlementSearchResultsProps>`
  display: grid;
  ${({ columns }) => `grid-template-columns: repeat(${columns}, 1fr);`}
`;

export const SettlementSearchResult = styled.div`
  padding: 2px;
`;
