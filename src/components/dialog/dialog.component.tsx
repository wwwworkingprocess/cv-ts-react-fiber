import React, { FC, useMemo } from "react";
import { CloseButton, DialogOverlay, StyledDialog } from "./dialog.styles";

type DialogProps = {
  isOpen: boolean;
  onClose: any;
  children: any;
  width?: number;
};

const Dialog: FC<DialogProps> = (props: DialogProps) => {
  const { isOpen, onClose, children, width } = props;
  //
  let dialog = useMemo(
    () => (
      <>
        <StyledDialog width={width}>
          <CloseButton onClick={onClose}>x</CloseButton>
          <div>{children}</div>
        </StyledDialog>
        <DialogOverlay onClick={onClose} />
      </>
    ),
    [children, width, onClose]
  );

  return isOpen ? dialog : null; // ), [isOpen, dialog]); // isOpen ? null : dialog;
  ///return useMemo(() => (isOpen ? dialog : null), [isOpen, dialog]); // isOpen ? null : dialog;
};

export default Dialog;
