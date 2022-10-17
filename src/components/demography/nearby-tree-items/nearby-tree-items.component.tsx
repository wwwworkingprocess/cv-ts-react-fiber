import { useMemo, useState } from "react";

import { distance } from "../../../utils/geo";
import TreeHelper from "../../../utils/tree-helper";

type NearbyTreeItemProps = {
  tree: TreeHelper | undefined;
  selectedCode: string | undefined;
  setSelectedCode: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const NearbyTreeItems = (props: NearbyTreeItemProps) => {
  const { tree, selectedCode, setSelectedCode } = props;
  //
  const isReady = tree && selectedCode;
  const node = isReady ? tree._n(selectedCode) : undefined;
  //
  const [range, setRange] = useState<number>(3);
  //
  const top10 = useMemo(() => {
    const data = node ? node.data : {};
    const { lat, lng } = data;
    //
    const all = tree ? tree.list_all() : [];
    //
    const nodes = all
      .map((n) => ({
        ...n,
        distance: distance([lat, lng], [n.data?.lat ?? 0, n.data?.lng ?? 0]),
      }))
      .filter((n) => n.distance * 10e-4 < range)
      .sort((a, b) => a.distance - b.distance);
    //
    nodes.shift(); // removing 'selectedCode' as it is closest to itself
    //
    return nodes;
  }, [tree, node, range]);
  //
  return tree && selectedCode ? (
    <div>
      {tree._n(selectedCode)?.name}, range
      <input
        type="number"
        value={range}
        style={{ width: "50px", margin: "0px 5px 0px 5px" }}
        onChange={(e) => setRange(parseInt(e.target.value))}
      />{" "}
      km
      <br />
      {top10.length === 0 ? "No matches." : ""}
      <div>
        {top10.map((n, idx) => (
          <div key={n.code}>
            <button onClick={(e) => setSelectedCode(`Q${n.code}`)}>
              {n.code}
            </button>
            {n.name} -- {(n.distance * 10e-4).toFixed(2)} km - {n.data?.pop}
          </div>
        ))}
      </div>
    </div>
  ) : null;
};

export default NearbyTreeItems;
