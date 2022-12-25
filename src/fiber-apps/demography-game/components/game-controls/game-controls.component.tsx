import { useMemo, useState } from "react";
import Button from "../../../../components/button/button.component";
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
  const { extra, selectionName, zoomToView, setExtra, scrollToDetails } = props;
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
              <Button onClick={(e) => setExtra(false)}>-</Button>
            ) : (
              <Button onClick={(e) => setExtra(true)}>+</Button>
            )}{" "}
            {selectionName?.length ? (
              <Button onClick={(e) => zoomToView(undefined)}>Zoom out</Button>
            ) : null}
            {lastTakenPlaceImage}
          </>
        )}
      </WrapToRight>
      <WrapToLeft width={showUI ? 282 : 75}>
        {showUI ? (
          <>
            <UserGui />
            <Button
              onClick={(e) => setShowUI(false)}
              style={{ marginTop: "5px" }}
            >
              Close
            </Button>
          </>
        ) : (
          <Button onClick={(e) => setShowUI(true)}>Settings</Button>
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
