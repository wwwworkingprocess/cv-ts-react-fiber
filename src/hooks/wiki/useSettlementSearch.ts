import { useMemo } from "react";

import TreeHelper from "../../utils/tree-helper";

const useSettlementSearch = (
  tree: TreeHelper | undefined,
  countryCode: string,
  keyword: string,
  showOnlyApplicable: boolean,
  sortByPopulation: boolean,
  maxItems: number
) => {
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
    if (sortByPopulation) {
      matchingNames.sort((a, b) =>
        !b.data ? -1 : !a.data ? 1 : (b.data?.pop ?? 0) - (a.data?.pop ?? 0)
      );
    } else {
      matchingNames.sort((a, b) => a.name.localeCompare(b.name));
    }
    //
    // reduce number of results before returning
    //
    const withPopulation = showOnlyApplicable
      ? matchingNames.filter((n) => n.data && n.data?.pop !== -1)
      : [];
    //
    const arr = showOnlyApplicable ? withPopulation : matchingNames;
    const reduced = arr.slice(0, maxItems);
    //
    return { reduced, orig: matchingNames, pop: withPopulation, countryCode };
  }, [
    tree,
    keyword,
    showOnlyApplicable,
    sortByPopulation,
    maxItems,
    countryCode,
  ]);
  //
  return searchResultsMemo;
};

export default useSettlementSearch;
