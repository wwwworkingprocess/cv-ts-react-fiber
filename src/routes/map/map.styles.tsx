import styled from "styled-components";

type HalfContentBlockProps = { minWidth: string };

export const BrowseSettlementContainer = styled.div`
  display: flex;
  max-height: 200px;
  overflow: hidden;
`;

export const HalfContentBlock = styled.div<HalfContentBlockProps>`
  ${({ minWidth }) => ({
    minWidth: `${minWidth}`,
  })}
  max-width: 50%;
  flex-grow: 1;
  max-height: 200px;
  overflow-x: hidden;
  border: solid 1px silver;
`;

// export const NearbyItemsContainer = styled.div`
//   display: flex;
//   max-height: 250px;
//   overflow: hidden;
// `;
