import create from "zustand";
import { persist } from "zustand/middleware";

export type GameAppStore = {
  zoom: boolean;
  moving: boolean;
  selectedCode: string | undefined;
  lastSelectedCode: string | undefined;
  //
  codesTaken: Array<string>;
  codesConverting: Array<string>;
  progressConverting: Record<string, number>;
  //
  count: number;
  bounds: [number, number, number, number];
  position: { x: number; y: number; z: number };
  //
  setMoving: (b: boolean, code: string) => void;
  setSelectedCode: (c: string | undefined) => void;
  setZoom: (b: boolean) => void;
  setProgressCompleted: (code: string) => void;
  //
  add: (n: number) => void;
  setBounds: (b: [number, number, number, number]) => void;
  setPosition: (p: { x: number; y: number; z: number }) => void;
  decreasePositionY: (timeout: number) => void;
};

const startPosition = { x: 17, y: 0, z: 45 } as {
  x: number;
  y: number;
  z: number;
};

//'HU': ('Hungary', (16.2022982113, 45.7594811061, 22.710531447, 48.6238540716)),
// const defaultBounds = [-3, 3, -2, 2] as [number, number, number, number];
const defaultBounds = [16, 23, 45, 49] as [number, number, number, number];

const onGameTick = (s: GameAppStore, nextTick: number) => {
  const CONVERSION_SPEED = 10;
  //
  // progress with constant speed, when player is
  // - not moving
  // - selection can be converted
  //
  const code = s.selectedCode;
  const notMoving = !s.moving && code !== undefined;
  //
  let isUpdatingProgress = false;
  let nextTargetProgress = 0;
  //
  if (notMoving) {
    isUpdatingProgress =
      s.codesConverting.includes(code) &&
      Object.keys(s.progressConverting).includes(code);
    //
    // console.log("onGameTick,updating?", isUpdatingProgress);
    //
    if (isUpdatingProgress) {
      const currentTargetProgress = s.progressConverting[code];
      //
      nextTargetProgress = currentTargetProgress + CONVERSION_SPEED;
    }
    //
    return {
      count: nextTick,
      progressConverting: {
        ...s.progressConverting,
        [code]: nextTargetProgress,
      },
    };
  }
  //
  return { count: nextTick, progressConverting: s.progressConverting };
};

const onArrived = (s: GameAppStore, code: string) => {
  let insert = false;
  //
  if (code) {
    const alreadyTaken = s.codesTaken.includes(code);
    const alreadyStarted = s.codesConverting.includes(code);
    //
    insert = !alreadyTaken && !alreadyStarted;
    //
    console.log("arrived with selection", code, insert && "adding...");
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
//
const onCityTaken = (s: GameAppStore, code: string) => {
  console.warn("onCityTaken", code);
  /*
    codesTaken: [] as Array<string>,
      codesConverting: [] as Array<string>,
      progressConverting: {} as Record<string, number>,
  */
  const nextCodesTaken = [...s.codesTaken, code];
  const nextCodesConverting = [
    ...(s.codesConverting.filter((c) => c !== code) ?? []),
  ];

  const nextEntriesProgressConverting = Object.entries(
    s.progressConverting
  ).filter(([k, v]) => k !== code);
  const nextProgressConverting = Object.fromEntries(
    nextEntriesProgressConverting
  );

  //
  return {
    //selectedCode: undefined,
    codesTaken: nextCodesTaken,
    codesConverting: nextCodesConverting,
    progressConverting: nextProgressConverting,
  };
};
//
const useGameAppStore = create<GameAppStore>(
  persist(
    (set, get, api) => ({
      zoom: false,
      moving: false,
      selectedCode: undefined,
      lastSelectedCode: undefined,
      //
      codesTaken: [] as Array<string>,
      codesConverting: [] as Array<string>,
      progressConverting: {} as Record<string, number>,
      //
      count: 0,
      bounds: defaultBounds,
      position: startPosition,
      //
      setMoving: (b, code) =>
        set((prev) => {
          console.log(
            "store-setMoving to",
            b,
            "prev",
            prev.moving,
            "target",
            code
          );
          // const hasArrived = !b && prev.moving;
          // const hasLeft = b && !prev.moving;

          //
          return prev.moving
            ? onArrived(prev, code)
            : {
                moving: true,
                codesConverting: prev.codesConverting,
                progressConverting: prev.progressConverting,
              };
        }),
      //
      setSelectedCode: (c) =>
        set((prev) => ({
          selectedCode: c,
          lastSelectedCode: prev.selectedCode,
        })),
      //
      // add to codeTaken, remove from codesConverting&progressConverting
      //
      setProgressCompleted: (c) => set((prev) => onCityTaken(prev, c)),
      //
      setZoom: (b) => set((prev) => ({ zoom: b })),
      //
      //add: (n) => set((prev) => ({ count: prev.count + n })),
      add: (n) =>
        set((prev) => {
          const nextTick = prev.count + n;
          const isGameTick = nextTick % 10 === 0;
          //
          return isGameTick
            ? onGameTick(prev, nextTick)
            : { count: nextTick, progressConverting: prev.progressConverting };
        }),
      //

      setBounds: (b) => set((prev) => ({ bounds: b })),
      setPosition: (p) => set((prev) => ({ position: p })),
      decreasePositionY: (timeout) => {
        setTimeout(
          () =>
            set((prev) => ({
              position: {
                ...prev.position,
                y: prev.position.y - 1,
              },
            })),
          timeout
        );
      },
      //
      //
      //
    }),
    {
      // ...
      name: "game-storage", // unique name
      onRehydrateStorage: () => (state) => {
        console.log("onRehydrateStorage");
        // state.setHasHydrated(true);
      },
    }
  )
);

// const useHydration = () => {
//   const [hydrated, setHydrated] = useState(useGameAppStore.persist.hasHydrated);

//   useEffect(() => {
//     const unsubHydrate = useGameAppStore.persist.onHydrate(() =>
//       setHydrated(false)
//     ); // Note: this is just in case you want to take into account manual rehydrations. You can remove this if you don't need it/don't want it.
//     const unsubFinishHydration = useGameAppStore.persist.onFinishHydration(() =>
//       setHydrated(true)
//     );

//     setHydrated(useGameAppStore.persist.hasHydrated());

//     return () => {
//       unsubHydrate();
//       unsubFinishHydration();
//     };
//   }, []);

//   return hydrated;
// };

export default useGameAppStore;
