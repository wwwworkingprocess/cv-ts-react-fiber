import { Billboard, BillboardProps, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

import useGameAppStore from "../stores/useGameAppStore";

const FrameCounter = (props: BillboardProps & { enabled: boolean }) => {
  // const { enabled } = props;
  const enabled = true;
  //
  const count = useGameAppStore((state) => state.count);
  const selectedCode = useGameAppStore((state) => state.selectedCode);
  const conversionSpeed = useGameAppStore(
    (state) => state.player.conversionSpeed
  );
  const takenCities = useGameAppStore((state) => state.player.takenCities);
  const takenPopulation = useGameAppStore(
    (state) => state.player.takenPopulation
  );
  //
  const totalCompletion = (takenCities ? takenCities / 3500 : 0) * 100.0;
  const totalCompletionPop =
    (takenPopulation ? takenPopulation / 9999999 : 0) * 100.0;

  //
  const add = useGameAppStore((state) => state.add);
  //
  useFrame(() => enabled && add(1));
  //
  if (!enabled) return null;
  //
  //
  return enabled ? (
    <Billboard {...props} follow={true} lockY={true}>
      <Text fontSize={0.023} onClick={() => add(3)}>
        {count} - {selectedCode ? conversionSpeed.toFixed(3) : takenPopulation}-{" "}
        {totalCompletion.toFixed(3)}% - {totalCompletionPop.toFixed(3)}%
      </Text>
    </Billboard>
  ) : null;
};

export default FrameCounter;
