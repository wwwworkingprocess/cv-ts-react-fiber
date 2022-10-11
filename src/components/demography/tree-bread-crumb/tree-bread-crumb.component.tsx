import { Fragment } from "react";

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
    <h3 style={{ marginBottom: "5px", marginTop: "5px" }}>
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
  setSelectedCode: React.Dispatch<React.SetStateAction<string | undefined>>;
}) => {
  const { selectedCode, setSelectedCode, tree } = props;
  //
  if (!tree) return null;
  //
  const node = selectedCode ? tree._n(selectedCode) : undefined;
  const pcodes = node ? tree.get_pcodes(node) : [];
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
