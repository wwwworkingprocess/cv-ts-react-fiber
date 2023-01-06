import { useMemo, useState } from "react";
import Button from "../../../../components/button/button.component";
import MiniMap from "../../../../components/hgt-viewer/mini-map/mini-map.component";
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
  const {
    path,
    extra,
    selectionName,
    canvasHeight,
    zoomToView,
    setExtra,
    scrollToDetails,
  } = props;
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
  const bounds = useGameAppStore((state) => state.bounds);
  //
  const [MIN_X, MAX_X, MIN_Y, MAX_Y] = bounds;
  const currentBounds = useMemo(() => {
    return {
      b: {
        min_x: MIN_Y, // ??? flipped x-y ???
        max_x: MAX_Y, // ??? flipped x-y ???
        min_y: MIN_X, // ??? flipped x-y ???
        max_y: MAX_X, // ??? flipped x-y ???
      },
    };
  }, [MIN_X, MAX_X, MIN_Y, MAX_Y]);
  //
  return (
    <div style={{ userSelect: "none" }}>
      <WrapToRight shiftTop={canvasHeight}>
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
      <WrapToLeft shiftTop={canvasHeight} width={showUI ? 282 : 75}>
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
      {canvasHeight > 300 ? (
        <WrapToBottomLeft>
          {displayedText}
          <small>{` ${detectedFps.toFixed(1)} fps`}</small>
          {!zoom && (
            <div style={{ top: "-96px", position: "absolute" }}>
              <MiniMap xyMemo={currentBounds} path={path} />
            </div>
          )}
        </WrapToBottomLeft>
      ) : null}
      {/* <DebugStorePanel /> */}
      <CloseWrap />
    </div>
  );
};

export default GameControls;
