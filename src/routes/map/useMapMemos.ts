import { useMemo } from "react";

import { useTreeHelper } from "../../hooks/useTreeHelper";
import { getAvailableCountryCodes } from "../../utils/country-helper";

import type { WikiCountry } from "../../utils/firebase/repo/wiki-country.types";

const availableCountryCodes = getAvailableCountryCodes();

const useMapMemos = (
  countryCode: string | undefined /* e.g. "Q28" */,
  wikiCountries: Array<WikiCountry> | null,
  selectedCountry: WikiCountry | undefined,
  selectedCode: string | undefined
) => {
  const { loading, tree, keys } = useTreeHelper(countryCode);
  //
  const selectedCountryCode = useMemo(
    () => (selectedCountry ? selectedCountry.code : undefined),
    [selectedCountry]
  );
  //
  const isTreeReady = useMemo(
    () => selectedCountryCode && !loading && tree !== undefined,
    [selectedCountryCode, loading, tree]
  );

  //
  // Countries level
  //
  const countries = useMemo(
    () =>
      wikiCountries
        ? wikiCountries.filter((c) => availableCountryCodes.includes(c.code))
        : [],
    [wikiCountries]
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
    const beautifyName = (countryCode: number, s: string) => {
      switch (countryCode) {
        case 28:
          return s.replaceAll(" County", "").replaceAll(" District", "");
        // case 36:
        //   return s.replaceAll(" Voivodeship", "").replaceAll(" province", "");
        // case 668:
        //   return s.replaceAll(" Pradesh", "");
        default:
          return s ? s : "";
      }
    };
    //
    return arr
      .map(([code, name, countryCode]) => ({
        code,
        name: beautifyName(countryCode, name),
        countryCode,
        size: tree?._children_of(tree._qq(code)).length ?? 0,
        data: tree?._n(code).data,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tree, selectedCountry, isAdminOneReady]);
  //
  // Admin Zone 2 or below level
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
  //
  //
  return useMemo(
    () => ({
      tree,
      //
      isTreeReady,
      isAdminOneReady,
      //
      countries,
      adminOneMemo,
      adminTwoMemo,
    }),
    [tree, isTreeReady, isAdminOneReady, countries, adminOneMemo, adminTwoMemo]
  );
};

export default useMapMemos;
