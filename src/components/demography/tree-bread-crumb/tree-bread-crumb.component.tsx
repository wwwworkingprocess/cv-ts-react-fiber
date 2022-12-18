import { Fragment, useMemo } from "react";
import { isMobile } from "react-device-detect";

import TreeHelper from "../../../utils/tree-helper";

//
//
//
const RegionHeader = (props: {
  parents: Array<{ code: number; name: string }>;
}) => {
  const { parents } = props;
  //
  if (!parents || parents.length < 3) return null;
  //
  const [earth, continent, subContinent] = parents;
  //
  return (
    <h3
      style={{
        marginBottom: "5px",
        marginTop: "0px",
        marginRight: "10px",
        fontSize: "14px",
        display: isMobile ? "block" : "inline-block",
      }}
    >
      {earth.name}, {continent.name}, {subContinent.name}
    </h3>
  );
};

//
//
//
const TreeBreadCrumb = (props: {
  selectedCode: string | undefined;
  tree: TreeHelper;
  //
  setSelectedCode: (c: string | undefined) => void;
}) => {
  const { selectedCode, setSelectedCode, tree } = props;
  //
  const node = useMemo(
    () => (tree && selectedCode ? tree._n(selectedCode) : undefined),
    [tree, selectedCode]
  );
  const pcodes = useMemo(
    () => (tree && node ? tree.get_pcodes(node) : []),
    [tree, node]
  );
  //
  //
  const parents = pcodes.map((code, idx) => ({
    code: pcodes[idx] ?? "",
    name: tree._find(code)?.name ?? "",
  }));
  //
  //
  //
  return (
    <>
      <RegionHeader parents={parents} />
      <br />
      {parents
        ? parents.map((p, level, arr) => (
            <Fragment key={`item_${level}`}>
              {/* Rendering item */}
              {level > 2 ? (
                <span>
                  <button
                    onClick={() => p.code && setSelectedCode(`Q${p.code}`)}
                  >
                    {p.name}
                  </button>
                </span>
              ) : null}
              {/* Rendering separator */}
              {level > 2 && level < arr.length - 1 && <span> &gt;&gt; </span>}
            </Fragment>
          ))
        : null}
    </>
  );
};

export default TreeBreadCrumb;
