import { Billboard, BillboardProps, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

import useGameAppStore from "../stores/useGameAppStore";

const FrameCounter = (props: BillboardProps & { enabled: boolean }) => {
  const { enabled } = props;
  //
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
  const setNextFrame = useGameAppStore((state) => state.setNextFrame);
  //
  useFrame(({ clock }) => {
    if (enabled) setNextFrame(1, clock.getDelta());
  });
  //
  //
  return enabled ? (
    <Billboard {...props} follow={true} lockY={true}>
      <Text fontSize={0.023}>
        {selectedCode ? `${conversionSpeed.toFixed(2)}/s` : takenPopulation}-{" "}
        {totalCompletion.toFixed(3)}% - {totalCompletionPop.toFixed(3)}%
      </Text>
    </Billboard>
  ) : null;
};

export default FrameCounter;
