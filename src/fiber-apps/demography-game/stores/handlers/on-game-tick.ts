import { GameAppStore } from "../types";

export const onGameTick = (s: GameAppStore, nextTick: number) => {
  const code = s.selectedCode;
  const notMoving = !s.moving && code !== undefined;
  //
  let isUpdatingProgress = false;
  let nextTargetProgress = 0;
  //
  const now = new Date().getTime();
  const last = s.lastTickTime ?? now;
  //
  const passed = (now - last) * 0.001;
  const fps = 10 / passed;
  //
  if (notMoving) {
    isUpdatingProgress =
      s.codesConverting.includes(code) &&
      Object.keys(s.progressConverting).includes(code);
    //
    if (isUpdatingProgress) {
      const speed = s.player.conversionSpeed;
      const currentTargetProgress = s.progressConverting[code];
      //
      nextTargetProgress = currentTargetProgress + speed;
    }
    //
    return {
      count: nextTick,
      lastTickTime: now,
      detectedFps: fps,
      progressConverting: {
        ...s.progressConverting,
        [code]: nextTargetProgress,
      },
    };
  }
  //
  return {
    count: nextTick,
    lastTickTime: now,
    detectedFps: fps,
    progressConverting: s.progressConverting,
  };
};
