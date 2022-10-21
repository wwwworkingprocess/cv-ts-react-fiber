import { useMemo, useState } from "react";
import useGameAppStore from "../../stores/useGameAppStore";

import DebugStorePanel from "../debug-store";
import UserGui from "../user-gui";

import {
  CloseWrap,
  WrapToBottomLeft,
  WrapToLeft,
  WrapToRight,
} from "./game-controls.styles";

const GameControls = (props: any) => {
  const { focus, zoomToView, extra, setExtra } = props;
  //
  const [showUI, setShowUI] = useState<boolean>(false);
  //
  const [zoom, moving, detectedFps] = useGameAppStore((s) => [
    s.zoom,
    s.moving,
    s.detectedFps,
  ]);

  //
  const displayedText = useMemo(
    () =>
      !zoom
        ? "Select a city"
        : moving
        ? "Moving..."
        : "Arrived at destination.",
    [zoom, moving]
  );
  //
  return (
    <>
      <WrapToRight>
        {zoom && (
          <>
            {/* extra={extra} setExtra={setExtra} */}
            {extra ? (
              <button onClick={(e) => setExtra(false)}>-</button>
            ) : (
              <button onClick={(e) => setExtra(true)}>+</button>
            )}
            <button onClick={(e) => focus && zoomToView(undefined)}>
              Zoom out
            </button>
          </>
        )}
      </WrapToRight>
      <WrapToLeft width={showUI ? 282 : 75}>
        {showUI ? (
          <>
            <UserGui />
            <button onClick={(e) => setShowUI(false)}>Close</button>
          </>
        ) : (
          <button onClick={(e) => setShowUI(true)}>Settings</button>
        )}
      </WrapToLeft>
      <WrapToBottomLeft>
        {displayedText}
        <small>{` ${detectedFps.toFixed(1)} fps`}</small>
      </WrapToBottomLeft>
      <DebugStorePanel />
      <CloseWrap />
    </>
  );
};

export default GameControls;
