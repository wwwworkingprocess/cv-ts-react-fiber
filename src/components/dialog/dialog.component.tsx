import React, { FC } from "react";
import { dialogCloseButtonStyles, dialogStyles } from "./dialog.styles";

type DialogProps = { isOpen: boolean; onClose: any; children: any };

const Dialog: FC<DialogProps> = (props: DialogProps) => {
  const { isOpen, onClose, children } = props;
  //
  let dialog = (
    <div style={dialogStyles as any}>
      <button style={dialogCloseButtonStyles as any} onClick={onClose}>
        x
      </button>
      <div>{children}</div>
    </div>
  );

  return !isOpen ? null : dialog;
};

export default Dialog;
