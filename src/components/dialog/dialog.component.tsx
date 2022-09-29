import React, { FC } from "react";
import { CloseButton, StyledDialog } from "./dialog.styles";

type DialogProps = { isOpen: boolean; onClose: any; children: any };

const Dialog: FC<DialogProps> = (props: DialogProps) => {
  const { isOpen, onClose, children } = props;
  //
  let dialog = (
    <StyledDialog>
      <CloseButton onClick={onClose}>x</CloseButton>
      <div>{children}</div>
    </StyledDialog>
  );

  return !isOpen ? null : dialog;
};

export default Dialog;
