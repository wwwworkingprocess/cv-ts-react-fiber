import { useState } from "react";
import { getTrackBackground, Range } from "react-range";

const RangeControl = (props: {
  setMinPop: React.Dispatch<React.SetStateAction<number>>;
  setMaxPop: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const { setMinPop, setMaxPop } = props;
  //
  const STEP = 100;
  const MIN = 0;
  const MAX = 50000;
  const [values, setValues] = useState([MIN, MAX]);

  return (
    <Range
      values={values}
      step={STEP}
      min={MIN}
      max={MAX}
      onChange={(values) => {
        console.log(values);
        setValues(values);
        setMinPop(values[0]);
        setMaxPop(values[1]);
      }}
      renderTrack={({ props, children }) => (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div
          onMouseDown={props.onMouseDown}
          onTouchStart={props.onTouchStart}
          style={{
            ...props.style,
            height: "36px",
            display: "flex",
            width: "100%",
          }}
        >
          <div
            ref={props.ref}
            style={{
              height: "5px",
              width: "100%",
              borderRadius: "4px",
              background: getTrackBackground({
                values,
                colors: ["#ccc", "#548BF4", "#ccc"],
                min: MIN,
                max: MAX,
              }),
              alignSelf: "center",
            }}
          >
            {children}
          </div>
        </div>
      )}
      renderThumb={({ props, isDragged }) => (
        <div
          {...props}
          style={{
            ...props.style,
            height: "42px",
            width: "42px",
            borderRadius: "4px",
            backgroundColor: "#FFF",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0px 2px 6px #AAA",
          }}
        >
          <div
            style={{
              height: "16px",
              width: "5px",
              backgroundColor: isDragged ? "#548BF4" : "#CCC",
            }}
          />
        </div>
      )}
    />
  );
};

export default RangeControl;
