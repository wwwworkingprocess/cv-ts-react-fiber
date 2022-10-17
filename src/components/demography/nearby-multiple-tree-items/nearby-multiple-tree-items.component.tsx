import { useMemo, useState } from "react";
import { distance } from "../../../utils/geo";
import TreeHelper, { findTreeNodesInRange } from "../../../utils/tree-helper";
import { CenterPoint, CenterPoints } from "./nearby-multiple-tree-items.styles";

type NearbyMultiplyTreeItemsProps = {
  tree: TreeHelper | undefined;
  selectedCode: string | undefined;
};

const NearbyMultiplyTreeItems = (props: NearbyMultiplyTreeItemsProps) => {
  const { tree, selectedCode } = props;
  //
  const [codes, setCodes] = useState<Array<string>>(
    selectedCode ? [selectedCode] : []
  );
  const addCode = (c: string) => !codes.includes(c) && setCodes([...codes, c]);
  const delCode = (c: string) =>
    codes.length > 1 &&
    setCodes([...(codes.filter((code) => code !== c) ?? [])]);
  //
  const [range, setRange] = useState<number>(4);
  //
  const top10 = useMemo(() => {
    if (tree && selectedCode && codes.length) {
      const results = [] as Array<any>;
      //
      for (const c of codes) {
        results.push(...findTreeNodesInRange(tree, tree._n(c), range, true));
      }
      //
      const qs = results.map((r) => r.code);
      //
      // all unique matching items, unsorted
      //
      const uresults = qs
        .filter((v, i, a) => a.indexOf(v) === i)
        .map((q) => results.find((r) => r.code === q));
      //
      // find lat&lng of first point, calc distance from 'origin'
      //
      const firstNode = tree._n(selectedCode);
      //
      const data = firstNode && firstNode.data ? firstNode.data : {};
      const { lat, lng } = data;
      //
      const resultsWithDistance = uresults.map((n) => ({
        ...n,
        distance: distance([lat, lng], [n.data?.lat ?? 0, n.data?.lng ?? 0]),
      }));
      //
      return resultsWithDistance.sort((a, b) => a.distance - b.distance);
    }
    //
    return [];
  }, [tree, selectedCode, codes, range]);

  //
  //
  //
  return tree && selectedCode ? (
    <div>
      Distance from {tree._n(selectedCode)?.name}, range:
      <input
        type="number"
        value={range}
        step={0.1}
        style={{ width: "50px", margin: "0px 5px 0px 5px" }}
        onChange={(e) => setRange(parseFloat(e.target.value))}
      />{" "}
      km
      <br />
      Center points:
      <CenterPoints>
        {codes.map((c) => (
          <CenterPoint
            key={c}
            maxWidth={
              codes.length === 1 ? "95%" : codes.length < 3 ? "49%" : "23%"
            }
          >
            <span onClick={(e) => delCode(c)}>{tree._n(c)?.name}</span>
            &nbsp;
          </CenterPoint>
        ))}
      </CenterPoints>
      <br />
      Match: {top10.length}
      <div>
        {top10.map((n, idx) => (
          <div key={`${n.code}_${n.distance}`}>
            {!codes.includes(`Q${n.code}`) ? (
              <button onClick={(e) => addCode(`Q${n.code}`)}>+</button>
            ) : (
              <div
                style={{
                  width: "25px",
                  height: "20px",
                  display: "inline-block",
                }}
              >
                &nbsp;
              </div>
            )}
            {n.name} -- {(n.distance * 10e-4).toFixed(2)} km - {n.data?.pop}
          </div>
        ))}
      </div>
      <hr />
    </div>
  ) : null;
};

export default NearbyMultiplyTreeItems;
