import { GameAppStore } from "../types";

export const onArrived = (s: GameAppStore, code: string) => {
  let insert = false;
  //
  if (code) {
    const alreadyTaken = s.codesTaken.includes(code);
    const alreadyStarted = s.codesConverting.includes(code);
    //
    insert = !alreadyTaken && !alreadyStarted;
  }
  //
  return {
    moving: false,
    //
    progressConverting:
      insert && code
        ? { ...s.progressConverting, [code]: 0 }
        : s.progressConverting,
    //
    codesConverting:
      insert && code ? [...s.codesConverting, code] : s.codesConverting,
  };
};
