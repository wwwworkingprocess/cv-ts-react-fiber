import styled from "styled-components";

type StyledDialogProps = { width?: number };

export const DialogOverlay = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 998;
  opacity: 0.8;
  background-color: #aaaaaa;
`;

export const StyledDialog = styled.div<StyledDialogProps>`
  position: fixed;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  max-height: 98vh;
  margin: 0 auto;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
  background-color: #eeeeee;
  padding: 10px 20px 40px;
  border-radius: 8px;
  ${({ width }) => width && { width: `${width || 500}px` }}
`;

export const CloseButton = styled.button`
  position: absolute;
  align-self: flex-end;
  width: 30px;
  height: 30px;
  margin-bottom: 15px;
  margin-right: -5px;
  padding: 3px 8px;
  cursor: pointer;
  border-radius: 50%;
  border: solid 1px #aaaaaa;
  font-weight: bold;
`;
