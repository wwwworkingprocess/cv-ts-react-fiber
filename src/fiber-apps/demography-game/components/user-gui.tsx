import { useState } from "react";

import DatGui, { DatColor, DatNumber, DatSelect } from "react-dat-gui";

const defaultOpts = {
  maxItems: 300,
  maxRange: 100,
  color: "#99ccff",
  materialType: "MeshPhongMaterial",
};

const UserGui = () => {
  const [opts, setOpts] = useState(defaultOpts);
  //
  return (
    <DatGui data={opts} onUpdate={setOpts}>
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
