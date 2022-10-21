import useGameAppStore from "../stores/useGameAppStore";

const DebugStorePanel = () => {
  const lastSelectedCode = useGameAppStore((state) => state.lastSelectedCode);
  const selectedCode = useGameAppStore((state) => state.selectedCode);
  //
  const codesTaken = useGameAppStore((state) => state.codesTaken);
  const codesConverting = useGameAppStore((state) => state.codesConverting);
  const progressConverting = useGameAppStore(
    (state) => state.progressConverting
  );
  //
  const resetStore = useGameAppStore((state) => state.reset);
  //
  return (
    <div style={{ fontSize: "9px" }}>
      {lastSelectedCode} &gt;&gt; {selectedCode}
      --- T: {codesTaken.length}- C: {codesConverting.length}- P:{" "}
      {Object.keys(progressConverting).length}
      ---
      <button
        onClick={(e) => {
          const approved = window.confirm("This will erase your progress");
          //
          if (approved) resetStore();
        }}
      >
        Reset
      </button>
    </div>
  );
};

export default DebugStorePanel;
