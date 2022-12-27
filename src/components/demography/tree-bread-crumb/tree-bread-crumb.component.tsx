import { Fragment, useMemo } from "react";
import { isMobile } from "react-device-detect";

import TreeHelper from "../../../utils/tree-helper";
import Button from "../../button/button.component";

//
//
//
const RegionHeader = (props: {
  parents: Array<{ code: number; name: string }>;
  isShort: boolean;
}) => {
  const { parents, isShort } = props;
  //
  if (!parents || parents.length < 3)
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
        {parents.map((p) => p.name).join(",")}
      </h3>
    );
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
      {isShort
        ? `${earth.name}, ${continent.name}`
        : `${earth.name}, ${continent.name}, ${subContinent.name}`}
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
  // Need to account for 'countries of South America',
  // where country level is 3 instead of 2
  //
  const southAmerica = 18;
  const isShortCrumb = useMemo(() => pcodes?.[1] === southAmerica, [pcodes]);
  const countryLevel = useMemo(() => (isShortCrumb ? 2 : 3), [isShortCrumb]);
  const parents = pcodes.map((code, idx) => ({
    code: pcodes[idx] ?? "",
    name: tree._find(code)?.name ?? "",
  }));

  //
  const invalidParentBlock = useMemo(() => {
    if (!selectedCode) return null;
    //
    const node = tree._n(selectedCode);
    //
    if (!node) return null;
    //
    return (
      <>
        {node.p === -1 ? "(NO PARENT)" : "(INVALID PARENT)"}
        <span> ➡️ </span>
        {node.name}
      </>
    );
  }, [tree, selectedCode]);

  //
  //
  //
  return (
    <>
      <RegionHeader parents={parents} isShort={isShortCrumb} />
      <br />
      {parents.length
        ? parents.map((p, level, arr) => (
            <Fragment key={`item_${level}`}>
              {/* Rendering item */}
              {level >= countryLevel ? (
                <span>
                  <Button
                    onClick={() => p.code && setSelectedCode(`Q${p.code}`)}
                  >
                    {p.name}
                  </Button>
                </span>
              ) : null}
              {/* Rendering separator */}
              {level >= countryLevel && level < arr.length - 1 && (
                <span> ➡️ </span>
              )}
            </Fragment>
          ))
        : invalidParentBlock}
    </>
  );
};

export default TreeBreadCrumb;
