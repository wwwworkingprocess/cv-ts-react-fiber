import { useEffect, useMemo, useState } from "react";

import { useTreeHelper } from "../../hooks/useTreeHelper";

import type { WikiCountry } from "../../utils/firebase/repo/wiki-country.types";
import type TreeHelper from "../../utils/tree-helper";
import { treeFromJson } from "../../utils/tree-helper";

export type ReducedTypeMemo = {
  admins: Array<any>;
  countries: Array<any>;
  rests: Array<any>;
  settlements: Array<any>;
  total: number;
};

export type TypeMemo = {
  known: {
    t: number;
    label: any;
    count: number;
    pns: string;
  }[];
  unknown: {
    t: number;
    label: any;
    count: number;
    pns: string;
  }[];
  memo: {
    ids: {
      used: any[];
      rest: any[];
    };
    countries: any[][];
    admins: any[][];
    settlements: any[][];
    rest: any[][];
    sizeLeaf: number;
    sizeTotal: number;
  };
  reducedMemo: ReducedTypeMemo;
  coverage: string;
};

export const getTypeTreeGroups = (tree: TreeHelper, useAllNodes?: boolean) => {
  const leafNodes = useAllNodes
    ? Object.keys(tree.NODES).map((code) => tree._n(String(code)))
    : tree.getLeafNodes();
  const leafNodesWithPath = leafNodes.map((node) => [
    node.code,
    tree.get_pcodes(node),
    node.name,
  ]);
  //
  const countryTypeId = 183039; // root-country
  const countryTypes = leafNodesWithPath.filter(
    ([c, chain, n]) => chain[1] === countryTypeId
  );
  //
  const admin = 56061; // any-admin
  const adminTypes = leafNodesWithPath.filter(
    ([c, chain, n]) => chain[1] === admin
  );
  const settlement = 486972; // human settlement
  const settlementTypes = leafNodesWithPath.filter(
    ([c, chain, n]) => chain[1] === settlement
  );
  //
  const allIds = leafNodes.map((node) => node.code);
  const usedIds = [
    ...countryTypes.map((t) => t[0]),
    ...adminTypes.map((t) => t[0]),
    ...settlementTypes.map((t) => t[0]),
  ].sort((a, b) => a - b);
  //
  const restIds = allIds
    .filter((id) => !usedIds.includes(id))
    .sort((a, b) => a - b);
  //const countryTypes = tree.getLeafNodes();
  // console.log("leaf nodes", leafNodes);
  // console.log("leaf nodes", leafNodesWithPath);
  /*
  console.log("countryTypes", countryTypes);
  console.log("settlementTypes", settlementTypes);
  console.log("adminTypes", adminTypes);
  */
  const restTypes = leafNodesWithPath.filter(([code]) =>
    restIds.includes(code)
  );
  //
  const envelope = {
    ids: {
      used: usedIds,
      rest: restIds,
    },
    //
    countries: countryTypes,
    admins: adminTypes,
    settlements: settlementTypes,
    rest: restTypes,
    //
    sizeLeaf: tree.getLeafNodes().length,
    sizeTotal: tree.size(),
  };
  //
  return envelope;
};

const useMapMemos = (
  countryCode: string | undefined /* e.g. "Q28" */,
  wikiCountries: Array<WikiCountry> | null,
  selectedCountry: WikiCountry | undefined,
  selectedCode: string | undefined,
  topResultsLength: number,
  topTypeResultsLength: number,
  selectedTypeId: number | undefined,
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
  // Using type information
  //
  const typeMemo: TypeMemo | undefined = useMemo(
    //() => (typeTree ? getTypeTreeGroups(typeTree) : undefined),
    () => {
      if (isTreeReady && typeTree && tree) {
        const useAllNodes = true;
        const memo = getTypeTreeGroups(typeTree, useAllNodes);
        const { rest, used } = memo.ids;
        const memoIds = [...rest, ...used].sort((a, b) => a - b);

        console.log("memo ids", memoIds);
        //
        const types = tree.list_by_type();
        // const treeTypes = Object.entries(types);
        // const treeTypes = Object.entries(types);
        const instancedTypeIds = Object.keys(types).map((s: string) =>
          parseInt(s)
        );
        //
        console.log("instance ids", instancedTypeIds);
        const knownIds = instancedTypeIds
          .map((t: number) => [t, memoIds.includes(t)])
          .filter(([t, b]) => Boolean(b))
          .map(([type]) => Number(type));
        const unknownIds = instancedTypeIds
          .map((t: number) => [t, memoIds.includes(t)])
          .filter(([t, b]) => !Boolean(b))
          .map(([type]) => Number(type));
        console.log("unknown ids", unknownIds);
        console.log("known ids", knownIds);

        // console.log("counting instances - known", treeTypes[0]);
        //
        // known: ids and count
        //
        const knownIdsWithCount = knownIds
          .map((t) => ({
            t,
            label: typeTree._find(t).name,
            count: tree.typeSize(t),
            pns: typeTree.get_pnames(typeTree._find(t)),
          }))
          .sort((a, b) => b.count - a.count);
        const knownInstanceCount = knownIdsWithCount
          .map((t) => t.count)
          .reduce((a, b) => a + b, 0);
        console.log("known ids", knownIdsWithCount);
        console.log("known instances", knownInstanceCount);

        //
        // unknown: ids and count
        //
        const unknownIdsWithCount = unknownIds
          .map((t) => ({
            t,
            label: typeTree._find(t)?.name ?? `Q${t}`,
            count: tree.typeSize(t),
            pns: "",
          }))
          .sort((a, b) => b.count - a.count);
        const unknownInstanceCount = unknownIdsWithCount
          .map((t) => t.count)
          .reduce((a, b) => a + b, 0);
        console.log("unknown ids", unknownIdsWithCount);
        console.log("unknown instances", unknownInstanceCount);
        //
        const totalCount = knownInstanceCount + unknownInstanceCount;
        const coverage = `${(knownInstanceCount / (0.01 * totalCount)).toFixed(
          2
        )}%`;

        //
        //
        console.log("type coverage", coverage, " of instances");
        //
        // creating reduced memo from memo
        //
        const reduceMemo = () => {
          const { countries, admins, settlements, rest, ids } = memo;
          //
          const usedIds = ids.used;
          //
          const getInstanceCount = (type: number) => tree.typeSize(type);
          const hasInstance = (type: number) => getInstanceCount(type) > 0;
          //
          const countriesUsed = countries.filter(([t]) => hasInstance(t));
          const adminsUsed = admins.filter(([t]) => hasInstance(t));
          const settlementsUsed = settlements.filter(([t]) => hasInstance(t));
          const restsUsed = rest.filter(([t]) => hasInstance(t));
          //
          // sorting ids by number of instances descending
          //
          //
          const byInstancesDesc = ([atype]: Array<any>, [btype]: Array<any>) =>
            getInstanceCount(btype) - getInstanceCount(atype);
          countriesUsed.sort(byInstancesDesc);
          adminsUsed.sort(byInstancesDesc);
          settlementsUsed.sort(byInstancesDesc);
          restsUsed.sort(byInstancesDesc);
          //
          console.log("Reduced", countries.length, "->", countriesUsed.length);
          console.log("Reduced", admins.length, "->", adminsUsed.length);
          console.log(
            "Reduced",
            settlements.length,
            "->",
            settlementsUsed.length
          );
          console.log("Rest", rest.length, "->", restsUsed.length);
          //
          const total =
            countriesUsed.length +
            adminsUsed.length +
            settlementsUsed.length +
            restsUsed.length;
          //
          // usedIds;
          //
          console.log("usedIds", usedIds);

          console.log("unknownIds", unknownIds);
          //
          return {
            countries: countriesUsed,
            admins: adminsUsed,
            settlements: settlementsUsed,
            rests: restsUsed,
            total,
          };
        };
        //
        return {
          known: knownIdsWithCount,
          unknown: unknownIdsWithCount,
          memo,
          reducedMemo: reduceMemo(),
          coverage,
        };
      }
      //
      return undefined;
    },
    //
    [isTreeReady, typeTree, tree]
  );

  const isTreeWithMemoReady = useMemo(
    () =>
      isTreeReady && typeTree !== undefined && typeMemo !== undefined
        ? typeMemo
        : undefined,
    [isTreeReady, typeTree, typeMemo]
  );

  // const [gData, setGData] = useState<{ nodes: []; links: [] }>();
  const gData = useMemo(() => {
    if (typeMemo) {
      console.log("typeMemo ready", typeMemo);
      //
      if (typeTree && tree) {
        const instances = tree.list_by_type();
        //
        // clone nodes of type tree
        //
        const clones = treeFromJson(typeTree.toJson());
        const _nodes = Object.values(clones.NODES).map((c) => ({
          id: String(c.code),
          group: String(c.p),
          ...c,
        }));
        //
        const _links = _nodes
          .filter((n) => n.id !== "3")
          .map((n) => ({
            source: String(n.id),
            target: String(n.p), // n.p),
          }));

        const allTargets = Array.from(new Set(_links.map((l) => l.target)))
          .map((s) => parseInt(s))
          .sort((a, b) => a - b);
        const leafs = _nodes.filter(
          (n) => !allTargets.includes(parseInt(n.id))
        );
        const leafIds = leafs.map((n) => n.id);

        const nodesWithCount = _nodes.map((n) => ({
          ...n,
          count: (instances[String(n.id)] || []).length,
        }));
        //
        // console.log("nodes", _nodes, "links", _links);
        // console.log("allTargets", allTargets);
        // console.log("leafs", leafs);
        // console.log("leafIds", leafIds);
        // console.log("nodesWithCount", nodesWithCount);
        //
        const renderedNodes = nodesWithCount.map((n) => ({
          ...n,
          name: `${n.name} (${n.count})`,
        }));

        const renderedLinks = renderedNodes
          .filter((n) => n.id !== "3")
          .map((n) => ({
            source: String(n.id),
            target: String(n.p), // n.p),
            value: n.count,
            label: n.name,
          }));

        const gd = {
          nodes: [...renderedNodes] as Array<Record<string, any>>,
          links: [
            ...renderedLinks,
            //      { source: String(24017414), target: "3" }, // MISC NODE
          ] as Array<{ source: string; target: string }>,
        };
        //
        console.log("Type Graph data ready", gd, leafIds.length, "leaf nodes");
        //
        return gd;
      }
    }
    //
    return { nodes: [], links: [] };
  }, [typeMemo, tree, typeTree]);

  // //
  // // Countries level
  // //

  // const countries = useMemo(
  //   () =>
  //     wikiCountries
  //       ? wikiCountries.filter(isAvailable).sort(sortByNameAsc)
  //       : [],
  //   [wikiCountries]
  // );

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
      if (!s) {
        console.log("INVALID NAME", s);
      }
      switch (countryCode) {
        case 28:
          return (s ?? "")
            .replaceAll(" County", "")
            .replaceAll(" District", "");
        case 77:
          return (s ?? "").replaceAll(" Department", "");
        case 211:
          return (s ?? "").replaceAll(" Municipality", "");
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
  // Type level - top 10 matching type (strict / loose)
  //
  const topTypeCities = useMemo(() => {
    if (
      tree &&
      typeTree &&
      isTreeReady &&
      selectedCountryCode &&
      adminOneMemo
    ) {
      const all = tree.list_all();
      //
      // 1. include only selected type(s)
      //
      const includedTypes = selectedTypeId ? [selectedTypeId] : [];
      const filtered = all.filter((n) => includedTypes.includes(n.type));
      //
      const populationDesc = (a: any, b: any) => b.data?.pop - a.data?.pop;
      const sorted = filtered.sort(populationDesc);
      //
      // only return the desired number of elements
      //
      return sorted.slice(0, topTypeResultsLength);
    }
    //
    return [];
  }, [
    tree,
    typeTree,
    isTreeReady,
    selectedCountryCode,
    adminOneMemo,
    topTypeResultsLength,
    selectedTypeId,
  ]);

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
      typeMemo,
      //
      isAdminOneReady,
      //
      adminOneMemo,
      adminTwoMemo,
      //
      topTenCities,
      topTypeCities,
      //
      gData,
    }),
    [
      isTreeReady,
      //
      tree,
      typeTree,
      //
      typeMemo,
      //
      isAdminOneReady,
      adminOneMemo,
      adminTwoMemo,
      topTenCities,
      topTypeCities,
      //
      gData,
    ]
  );
};

export default useMapMemos;
