import { useMemo, useState } from "react";
import TreeHelper from "../../../utils/tree-helper";

type SettlementSearchProps = { tree: TreeHelper | undefined };

const SettlementSearch = (props: SettlementSearchProps) => {
  const { tree } = props;
  //
  const [keyword, setKeyword] = useState<string>("");
  //
  const searchResultsMemo = useMemo(() => {
    const nodes = tree && keyword && keyword.length > 1 ? tree.list_all() : [];
    //
    const matchingNames = nodes.filter(
      (node: any) =>
        node.name.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
    );
    //
    // sort by name before returning result
    //
    matchingNames.sort((a, b) => a.name.localeCompare(b.name));
    //
    return matchingNames;
  }, [tree, keyword]);
  //
  return (
    <>
      Keyword:{" "}
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />{" "}
      {keyword}
      <hr />
      <hr />{" "}
      {searchResultsMemo
        ? `Found ${searchResultsMemo.length} results for '${keyword}'`
        : "no results"}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
        }}
      >
        {searchResultsMemo
          ? searchResultsMemo.map((sr: any) => (
              <div>
                {sr.name} ({sr.data ? sr.data.pop : "-"})
              </div>
            ))
          : "no results"}
      </div>
    </>
  );
};

export default SettlementSearch;
