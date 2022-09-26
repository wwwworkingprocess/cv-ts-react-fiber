import { Billboard, BillboardProps, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

import useCursorAppStore from "../stores/useHgtSetViewerStore";

const FrameCounter = (props: BillboardProps & { enabled: boolean }) => {
  const { enabled } = props;
  //
  const count = useCursorAppStore((state) => state.count);
  const bounds = useCursorAppStore((state) => state.bounds);
  //
  const add = useCursorAppStore((state) => state.add);
  //
  const [MIN_X, MAX_X, MIN_Y, MAX_Y] = bounds;
  //
  useFrame(() => enabled && add(1));
  //
  if (!enabled) return null;
  //
  return enabled ? (
    <Billboard {...props}>
      <Text fontSize={0.3} onClick={() => add(3)}>
        {count} - {[MIN_X, MAX_X, MIN_Y, MAX_Y].join(" - ")}
      </Text>
    </Billboard>
  ) : null;
};

export default FrameCounter;
