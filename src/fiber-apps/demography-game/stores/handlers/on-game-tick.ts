import { GameAppStore } from "../types";

export const onGameTick = (s: GameAppStore, nextTick: number, t: number) => {
  const code = s.selectedCode;
  const notMoving = !s.moving && code !== undefined;
  //
  let isUpdatingProgress = false;
  let nextTargetProgress = 0;
  //
  const now = new Date().getTime();
  const lastFrameTime = s.lastTickTime ?? now;
  const seconds = t ?? 0; // Passed seconds since last GameTick
  const scoreScale = 2000; // Magic number to match displayed speed :)
  //
  //
  const passed = (now - lastFrameTime) * 0.001;
  const fps = 20 / passed;
  //
  if (notMoving) {
    isUpdatingProgress =
      s.codesConverting.includes(code) &&
      Object.keys(s.progressConverting).includes(code);
    //
    if (isUpdatingProgress) {
      const speed = s.player.conversionSpeed;
      const currentTargetProgress = s.progressConverting[code];
      const increment = speed * seconds * scoreScale;
      //
      nextTargetProgress = currentTargetProgress + increment;
    }
    //
    return {
      frame: nextTick,
      lastTickTime: now,
      sinceLastGameTick: 0,
      detectedFps: fps,
      progressConverting: {
        ...s.progressConverting,
        [code]: nextTargetProgress,
      },
    };
  }
  //
  return {
    frame: nextTick,
    lastTickTime: now,
    sinceLastGameTick: 0,
    detectedFps: fps,
    progressConverting: s.progressConverting,
  };
};
