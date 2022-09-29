import { isMobile } from "react-device-detect";

import { SettingsContainer } from "../../hgt-set-viewer-3d.styles";

type ViewerSettingsProps = {
  isShadowEnabled: boolean;
  isFloorEnabled: boolean;
  is3dGridEnabled: boolean;
  takePixel: number;
  heightScale: number;
  heightShift: number;
  //
  setIsShadowEnabled: React.Dispatch<React.SetStateAction<boolean>>;
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
    isShadowEnabled,
    isFloorEnabled,
    is3dGridEnabled,
    takePixel,
    heightScale,
    heightShift,
    setIsShadowEnabled,
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
      <label>Sample:</label>
      {[2, 3, 5, 6, 10, 15, 30].map((takeEveryNthPixel, idx) => (
        <button
          key={idx}
          onClick={(e) => setTakePixel(takeEveryNthPixel)}
          style={{
            fontSize: "9px",
            backgroundColor: takePixel === takeEveryNthPixel ? "#aaaaff" : "",
          }}
        >
          {takeEveryNthPixel}
        </button>
      ))}
      {isMobile && <br />}
      <label>
        Elevate {!isMobile && <small>({heightScale.toFixed(2)})</small>}:
      </label>
      <input
        type="range"
        min={0.1}
        max={3.0}
        step={0.05}
        value={heightScale}
        onChange={(e) => setHeightScale(parseFloat(e.target.value))}
        style={{ width: "80px" }}
      />
      <label>
        Y: {!isMobile && <small>({heightShift.toFixed(4)})</small>}:
      </label>
      <input
        type="range"
        min={0.0}
        max={1.0}
        step={0.0025}
        value={heightShift}
        onChange={(e) => setHeightShift(parseFloat(e.target.value))}
        style={{ width: "80px" }}
      />
      <label>Debug:</label>
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
      <label>Shadows:</label>
      <input
        type="checkbox"
        checked={isShadowEnabled}
        onChange={(e) => setIsShadowEnabled((b) => !b)}
      />
      <div>
        <button onClick={scrollToCanvas}>Scroll Here</button>
        <button onClick={scrollToTop}>Scroll Top</button>
      </div>
    </SettingsContainer>
  );
};

export default ViewerSettings;
