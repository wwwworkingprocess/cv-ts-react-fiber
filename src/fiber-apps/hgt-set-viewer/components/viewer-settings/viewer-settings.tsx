import { isMobile } from "react-device-detect";

import { SettingsContainer } from "../../hgt-set-viewer-3d.styles";

type ViewerSettingsProps = {
  isFloorEnabled: boolean;
  is3dGridEnabled: boolean;
  takePixel: number;
  heightScale: number;
  heightShift: number;
  //
  setTakePixel: React.Dispatch<React.SetStateAction<number>>;
  setHeightScale: React.Dispatch<React.SetStateAction<number>>;
  setHeightShift: React.Dispatch<React.SetStateAction<number>>;
  setIsFloorEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setIs3dGridEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  //
  scrollToTop: () => void;
  scrollToCanvas: () => void;
};

const ViewerSettings = (props: ViewerSettingsProps) => {
  const {
    isFloorEnabled,
    is3dGridEnabled,
    takePixel,
    heightScale,
    heightShift,
    setIsFloorEnabled,
    setIs3dGridEnabled,
    setTakePixel,
    setHeightScale,
    setHeightShift,
    scrollToTop,
    scrollToCanvas,
  } = props;
  //
  return (
    <SettingsContainer>
      Sample:
      {[2, 3, 5, 6, 10, 15, 30].map((takeEveryNthPixel, idx) => (
        <button
          key={idx}
          onClick={(e) => setTakePixel(takeEveryNthPixel)}
          style={{
            backgroundColor: takePixel === takeEveryNthPixel ? "#aaaaff" : "",
          }}
        >
          {takeEveryNthPixel}
        </button>
      ))}
      {isMobile && <br />}
      Height {!isMobile && <small>({heightScale.toFixed(2)})</small>}:
      <input
        type="range"
        min={0.1}
        max={3.0}
        step={0.05}
        value={heightScale}
        onChange={(e) => setHeightScale(parseFloat(e.target.value))}
        style={{ width: "80px" }}
      />
      Shift {!isMobile && <small>({heightShift.toFixed(4)})</small>}:
      <input
        type="range"
        min={0.0}
        max={1.0}
        step={0.0025}
        value={heightShift}
        onChange={(e) => setHeightShift(parseFloat(e.target.value))}
        style={{ width: "80px" }}
      />
      Helpers:
      <input
        type="checkbox"
        checked={is3dGridEnabled}
        onChange={(e) => setIs3dGridEnabled((b) => !b)}
      />
      <input
        type="checkbox"
        checked={isFloorEnabled}
        onChange={(e) => setIsFloorEnabled((b) => !b)}
      />
      <div style={{ float: "right", width: "160px" }}>
        <button onClick={scrollToCanvas}>Scroll Here</button>
        <button onClick={scrollToTop}>Scroll Top</button>
      </div>
    </SettingsContainer>
  );
};

export default ViewerSettings;
