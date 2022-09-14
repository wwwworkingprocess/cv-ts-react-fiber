import { isMobile } from "react-device-detect";
import useCursorAppStore from "../stores/useCursorAppStore";

const AxisValueInput = (props: {
  axis: "x" | "y" | "z";
  min: number;
  max: number;
}) => {
  const { axis, min, max } = props;
  //
  const position = useCursorAppStore((state) => state.position);
  const setPosition = useCursorAppStore((state) => state.setPosition);
  //
  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setPosition({ ...position, [axis]: parseInt(e.target.value) });
  //
  const onSafeDecreaseOne = (
    position: {
      x: number;
      y: number;
      z: number;
    },
    axis: "x" | "y" | "z"
  ) => {
    const oldValue = position[axis];
    const nextValue = Math.max(min, Math.min(oldValue - 1, max));
    //
    if (nextValue !== oldValue) setPosition({ ...position, [axis]: nextValue });
  };
  //
  const onSafeIncreaseOne = (
    position: {
      x: number;
      y: number;
      z: number;
    },
    axis: "x" | "y" | "z"
  ) => {
    const oldValue = position[axis];
    const nextValue = Math.max(min, Math.min(oldValue + 1, max));
    //
    if (nextValue !== oldValue) setPosition({ ...position, [axis]: nextValue });
  };

  //

  return !isMobile ? (
    <>
      <label>{axis}</label>
      <input
        min={min}
        max={max}
        onChange={onChange}
        value={position[axis]}
        type="number"
      />
    </>
  ) : (
    <>
      <label>
        {axis}{" "}
        <button onClick={() => onSafeDecreaseOne(position, axis)}>-</button>
        {position[axis]}{" "}
        <button onClick={() => onSafeIncreaseOne(position, axis)}>+</button>
      </label>
    </>
  );
};

export default AxisValueInput;
