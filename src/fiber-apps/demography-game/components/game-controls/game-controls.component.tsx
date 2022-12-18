import { useMemo, useState } from "react";
import useGameAppStore from "../../stores/useGameAppStore";

// import DebugStorePanel from "../debug-store";
import UserGui from "../user-gui";

import {
  CloseWrap,
  LastTakenPlace,
  WrapToBottomLeft,
  WrapToLeft,
  WrapToRight,
} from "./game-controls.styles";

const GameControls = (props: any) => {
  const { focus, extra, selectionName, zoomToView, setExtra, scrollToDetails } =
    props;
  //
  const [showUI, setShowUI] = useState<boolean>(false);
  //

  const lastTakenPlaceImageUrl = useGameAppStore((s) => s.lastFeature.imageUrl);
  const [zoom, moving, detectedFps] = useGameAppStore((s) => [
    s.zoom,
    s.moving,
    s.detectedFps,
  ]);
  //

  //
  const displayedText = useMemo(
    () =>
      !zoom
        ? "Select a city"
        : moving
        ? "Moving..."
        : `Arrived at ${selectionName}.`,
    [zoom, moving, selectionName]
  );
  //
  const lastTakenPlaceImage = useMemo(() => {
    return lastTakenPlaceImageUrl ? (
      <LastTakenPlace>
        <img src={lastTakenPlaceImageUrl} alt="" onClick={scrollToDetails} />
      </LastTakenPlace>
    ) : null;
  }, [lastTakenPlaceImageUrl, scrollToDetails]);
  //
  return (
    <div style={{ userSelect: "none" }}>
      <WrapToRight>
        {zoom && (
          <>
            {extra ? (
              <button onClick={(e) => setExtra(false)}>-</button>
            ) : (
              <button onClick={(e) => setExtra(true)}>+</button>
            )}
            <button onClick={(e) => focus && zoomToView(undefined)}>
              Zoom out
            </button>
            {lastTakenPlaceImage}
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
      {/* <DebugStorePanel /> */}
      <CloseWrap />
    </div>
  );
};

export default GameControls;
