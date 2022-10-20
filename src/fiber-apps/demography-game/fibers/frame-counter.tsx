import { Billboard, BillboardProps, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

import useGameAppStore from "../stores/useGameAppStore";

const FrameCounter = (props: BillboardProps & { enabled: boolean }) => {
  // const { enabled } = props;
  const enabled = true;
  //
  const count = useGameAppStore((state) => state.count);
  const selectedCode = useGameAppStore((state) => state.selectedCode);
  //
  const add = useGameAppStore((state) => state.add);
  //
  useFrame(() => enabled && add(1));
  //
  if (!enabled) return null;
  //
  return enabled ? (
    <Billboard {...props} follow={true} lockY={true}>
      <Text fontSize={0.03} onClick={() => add(3)}>
        {count} - {selectedCode}
      </Text>
    </Billboard>
  ) : null;
};

export default FrameCounter;
