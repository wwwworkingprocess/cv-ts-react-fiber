import styled from "styled-components";

export const StyledDialog = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  width: 500px;
  max-width: 100%;
  margin: 0 auto;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
  background-color: #eeeeee;
  padding: 10px 20px 40px;
  border-radius: 8px;
`;

export const CloseButton = styled.button`
  position: absolute;
  align-self: flex-end;
  width: 30px;
  height: 30px;
  margin-bottom: 15px;
  padding: 3px 8px;
  cursor: pointer;
  border-radius: 50%;
  border: none;
  font-weight: bold;
`;
