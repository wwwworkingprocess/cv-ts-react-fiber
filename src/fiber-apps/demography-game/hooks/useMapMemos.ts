import { useMemo } from "react";

import { useTreeHelper } from "../../../hooks/useTreeHelper";
import { beautifyAdminOneName } from "../../../utils/country-helper";

import type { WikiCountry } from "../../../utils/firebase/repo/wiki-country.types";

const useMapMemos = (
  countryCode: string | undefined /* e.g. "Q28" */,
  wikiCountries: Array<WikiCountry> | null,
  selectedCountry: WikiCountry | undefined,
  selectedCode: string | undefined,
  topResultsLength: number,
  path?: string
) => {
  const { loading, tree, keys, typeTree } = useTreeHelper(countryCode, path);
  //
  const selectedCountryCode = useMemo(
    () => (selectedCountry ? selectedCountry.code : undefined),
    [selectedCountry]
  );
  //
  const isTreeReady = useMemo(
    () =>
      selectedCountryCode &&
      !loading &&
      tree !== undefined &&
      typeTree !== undefined,
    [selectedCountryCode, loading, tree, typeTree]
  );

  //
  // Admin Zone 1 level
  //
  const isAdminOneReady = useMemo(
    () =>
      !loading &&
      tree &&
      selectedCountry &&
      keys.includes(selectedCountry.code),
    [loading, tree, keys, selectedCountry]
  );
  //
  //
  //
  const adminOneMemo = useMemo(() => {
    if (!tree || !selectedCountry || !isAdminOneReady) return [];
    //
    const arr = tree._children_of(tree._qq(selectedCountry.code));
    //
    return arr
      .map(([code, name, countryCode]) => ({
        code,
        name: beautifyAdminOneName(countryCode, name),
        countryCode,
        size: tree?._children_of(tree._qq(code)).length ?? 0,
        data: tree?._n(code).data,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tree, selectedCountry, isAdminOneReady]);

  //
  // Admin Zone 2 level
  //
  const isAdminTwoReady = useMemo(
    () => !loading && tree && selectedCode && keys.includes(selectedCode),
    [loading, tree, keys, selectedCode]
  );
  //
  const adminTwoMemo = useMemo(() => {
    const isReady = tree && isAdminTwoReady && selectedCode; //!loading && keys.length && tree && selectedCode;
    const selectedNode = isReady ? tree._n(selectedCode) : undefined;
    //
    // when [selectedNode] is [selectedCountryCode], returning empty list
    // when [selectedNode] is leaf, returning siblings instead of children
    //
    let arr;
    //
    if (isReady && selectedNode) {
      const isAdminOneLevel = selectedCode === selectedCountryCode;
      const isLeaf = tree?._is_leaf(selectedNode.code);
      //
      if (isAdminOneLevel) {
        arr = [] as Array<Array<any>>; // skip
      } else {
        if (isLeaf) {
          const parentCode = parseInt(selectedNode.p || "3");
          //
          arr = isReady ? tree._children_of(parentCode) : [];
        } else {
          arr = isReady ? tree._children_of(tree._qq(selectedCode)) : [];
        }
      }
    } else arr = [] as Array<Array<any>>;

    //
    // resolving item-details (number of children, treeNode)
    //
    const expanded = arr
      .map(([code, name, parentCode]) => [
        code,
        name,
        parentCode,
        tree?._children_of(tree._qq(code || "")).length ?? 0,
        tree?._n(code).data,
      ])
      .filter((arr) => arr[4] !== undefined);

    //
    // sorting resultset by population descending
    //
    expanded.sort((a, b) => (b[4].pop || 0) - (a[4].pop || 0));
    //
    return expanded;
  }, [tree, isAdminTwoReady, selectedCountryCode, selectedCode]);

  //
  // City level - top 10 populated
  //
  const topTenCities = useMemo(() => {
    if (tree && isTreeReady && selectedCountryCode && adminOneMemo) {
      const all = tree.list_all();
      //
      // 1. exclude selected country and extremals
      // 2. exclude admin ones
      //
      const toNum = (s: string): number => parseInt(s.replace("Q", ""));
      //
      const adminOneCodes = adminOneMemo.map((a) => toNum(a.code));
      const excludedCodes = [-1, toNum(selectedCountryCode), ...adminOneCodes];
      const excludedTypes = [6256, 3624078];
      //
      const filtered = all.filter(
        (n) =>
          !excludedCodes.includes(n.code) && !excludedTypes.includes(n.type)
      );
      //
      // 3. exclude where parent is not set
      // 4. exclude where no population info available
      // 5. (!) exclude where name is NOT one word, (e.g. excludes New York, keeps Toronto)
      //
      const hasParent = (n: any) => n.p !== -1;
      const hasPopulation = (n: any) => (n?.data?.pop ?? -1) > 0;
      const hasShortName = (n: any) => !(n.name ?? "").includes(" ");
      //
      const populationDesc = (a: any, b: any) => b.data.pop - a.data.pop;
      const withPopulation = filtered
        .filter(hasParent)
        .filter(hasPopulation)
        .filter(hasShortName) // not perfect, but works well
        .sort(populationDesc);

      //
      // only return the desired number of elements
      //
      return withPopulation.slice(0, topResultsLength);
    }
    //
    return [];
  }, [tree, isTreeReady, selectedCountryCode, adminOneMemo, topResultsLength]);

  //
  //
  //
  return useMemo(
    () => ({
      isTreeReady,
      //
      tree,
      typeTree,
      //
      isAdminOneReady,
      //
      adminOneMemo,
      adminTwoMemo,
      //
      topTenCities,
    }),
    [
      isTreeReady,
      //
      tree,
      typeTree,
      //
      isAdminOneReady,
      adminOneMemo,
      adminTwoMemo,
      topTenCities,
    ]
  );
};

export default useMapMemos;
