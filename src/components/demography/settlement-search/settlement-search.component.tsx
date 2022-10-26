import { useEffect, useMemo, useState } from "react";
import useGameAppStore from "../../../fiber-apps/demography-game/stores/useGameAppStore";

import useSettlementSearch from "../../../hooks/wiki/useSettlementSearch";

import TreeHelper from "../../../utils/tree-helper";
import {
  SettlementSearchResults,
  SettlementSearchResult,
} from "./settlement-search.styles";

type SettlementSearchProps = {
  tree: TreeHelper | undefined;
  countryCode: string;
};

const MAX_RESULTS_KEYWORD_SEARCH = 25;

const SettlementSearch = (props: SettlementSearchProps) => {
  const { tree, countryCode } = props;
  //
  const [selectedCode, setSelectedCode] = useGameAppStore((s) => [
    s.selectedCode,
    s.setSelectedCode,
  ]);
  //
  const [sortByPopulation, setSortByPopulation] = useState<boolean>(true);
  const [showOnlyApplicable, setShowOnlyApplicable] = useState<boolean>(true);
  const [maxItems, setMaxItems] = useState<number>(MAX_RESULTS_KEYWORD_SEARCH);
  const [keyword, setKeyword] = useState<string>("");
  //
  const searchResultsMemo = useSettlementSearch(
    tree,
    countryCode,
    keyword,
    showOnlyApplicable,
    sortByPopulation,
    maxItems
  );
  //
  useEffect(() => {
    setKeyword(""); // reset keyword when country is changing
  }, [countryCode]);
  //
  const resultAsText = useMemo(
    () =>
      searchResultsMemo
        ? searchResultsMemo.orig.length
          ? `Found ${
              searchResultsMemo.orig.length
            } results for '${keyword}', showing ${Math.min(
              searchResultsMemo.reduced.length,
              maxItems
            )} / ${searchResultsMemo.orig.length}.`
          : keyword.length < 2
          ? "" // "Keyword is too short."
          : `No results for '${keyword}'`
        : "No results.",
    [keyword, maxItems, searchResultsMemo]
  );
  //
  return (
    <>
      Keyword:{" "}
      <input
        type="text"
        value={keyword}
        style={{ width: "80px" }}
        placeholder={"min 2 chars..."}
        onChange={(e) => setKeyword(e.target.value)}
      />{" "}
      Exclude falsy:{" "}
      <input
        type="checkbox"
        checked={showOnlyApplicable}
        onChange={(e) => setShowOnlyApplicable((b) => !b)}
      />{" "}
      Sort by {sortByPopulation ? "population" : "name"}:{" "}
      <input
        type="checkbox"
        checked={sortByPopulation}
        onChange={(e) => setSortByPopulation((b) => !b)}
      />{" "}
      Max:
      <input
        type="number"
        step={10}
        min={10}
        max={10000}
        value={maxItems}
        style={{ width: "50px" }}
        onChange={(e) => setMaxItems(parseInt(e.target.value))}
      />{" "}
      results
      {searchResultsMemo.reduced.length ? (
        <>
          <hr />
          <SettlementSearchResults columns={4}>
            {searchResultsMemo
              ? searchResultsMemo.reduced.map((sr: any, idx) => (
                  <SettlementSearchResult
                    key={idx}
                    onClick={(e) => setSelectedCode(`Q${sr.code}`)}
                    style={{
                      color: selectedCode === `Q${sr.code}` ? "gold" : "white",
                    }}
                  >
                    {sr.name}
                  </SettlementSearchResult>
                ))
              : "no results"}
          </SettlementSearchResults>
        </>
      ) : null}
      {resultAsText ? (
        <>
          <hr />
          {resultAsText}
        </>
      ) : null}
    </>
  );
};

export default SettlementSearch;
