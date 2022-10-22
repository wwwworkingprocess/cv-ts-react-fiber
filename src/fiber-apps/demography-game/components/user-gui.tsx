import { useMemo, useState } from "react";

import DatGui, { DatColor, DatNumber, DatSelect } from "react-dat-gui";
import useGameAppStore from "../stores/useGameAppStore";

const defaultOpts = {
  maxItems: 200,
  maxRange: 50,
  color: "#000055",
  materialType: "MeshPhongMaterial",
};

const UserGui = () => {
  const userColor = useGameAppStore((state) => state.userColor);
  const setUserColor = useGameAppStore((state) => state.setUserColor);
  //
  const getDefaultOptions = useMemo(
    () => ({
      ...defaultOpts,
      color: userColor,
    }),
    [userColor]
  );
  //
  const [opts, setOpts] = useState(getDefaultOptions);

  //
  const onOptionsChanged = (data: any) => {
    console.log("data", data);
    //
    if (data.color !== userColor) {
      setUserColor(data.color); // update state
    }
    //
    setOpts(data); // update ui
  };

  //
  return (
    <DatGui data={opts} onUpdate={onOptionsChanged}>
      <DatNumber path="maxItems" min={50} max={500} step={1} />
      <DatNumber path="maxRange" min={1} max={100} step={0.1} />
      <DatSelect
        path="materialType"
        label="material"
        options={["MeshBasicMaterial", "MeshPhongMaterial"]}
      />
      <DatColor path="color" />
    </DatGui>
  );
};

export default UserGui;
