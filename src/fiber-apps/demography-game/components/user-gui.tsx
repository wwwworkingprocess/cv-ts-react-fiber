import { useMemo, useState } from "react";

import DatGui, { DatColor, DatNumber, DatSelect } from "react-dat-gui";
import useGameAppStore from "../stores/useGameAppStore";

const defaultOpts = {
  maxItems: 200,
  maxRange: 50,
  color: "#000055",
  citiesSortType: "MeshPhongMaterial",
};

const UserGui = () => {
  const userColor = useGameAppStore((state) => state.userColor);
  const citiesMaxRangeKm = useGameAppStore((state) => state.citiesMaxRangeKm);
  const citiesMaxItems = useGameAppStore((state) => state.citiesMaxItems);
  const citiesShowPopulated = useGameAppStore(
    (state) => state.citiesShowPopulated
  );

  //
  const setUserColor = useGameAppStore((state) => state.setUserColor);
  const setCitiesMaxRangeKm = useGameAppStore(
    (state) => state.setCitiesMaxRangeKm
  );
  const setCitiesMaxItems = useGameAppStore((state) => state.setCitiesMaxItems);
  const setCitiesShowPopulated = useGameAppStore(
    (state) => state.setCitiesShowPopulated
  );
  //
  const getDefaultOptions = useMemo(
    () => ({
      ...defaultOpts,
      color: userColor,
      maxItems: citiesMaxItems,
      maxRange: citiesMaxRangeKm,
      citiesSortType: citiesShowPopulated
        ? "Most populated"
        : "Least populated.",
    }),
    [userColor, citiesMaxItems, citiesMaxRangeKm, citiesShowPopulated]
  );
  //
  const [opts, setOpts] = useState(getDefaultOptions);

  //
  const onOptionsChanged = (data: any) => {
    if (data.color !== userColor) setUserColor(data.color); // update state
    if (data.maxItems !== userColor) setCitiesMaxItems(data.maxItems); // update state
    if (data.maxRange !== userColor) setCitiesMaxRangeKm(data.maxRange); // update state
    //
    if (data.citiesSortType === "Most populated") {
      if (!citiesShowPopulated) setCitiesShowPopulated(true); // update state
    } else {
      if (citiesShowPopulated) setCitiesShowPopulated(false); // update state
    }
    //
    setOpts(data); // update ui
  };

  //
  return (
    <DatGui data={opts} onUpdate={onOptionsChanged}>
      <DatNumber
        label="Max Features"
        path="maxItems"
        min={50}
        max={500}
        step={1}
      />
      <DatNumber
        label="Max Range(km)"
        path="maxRange"
        min={1}
        max={100}
        step={0.5}
      />
      <DatSelect
        path="citiesSortType"
        label="Display cities"
        options={["Most populated", "Least populated."]}
      />
      <DatColor label="Your color" path="color" />
    </DatGui>
  );
};

export default UserGui;
