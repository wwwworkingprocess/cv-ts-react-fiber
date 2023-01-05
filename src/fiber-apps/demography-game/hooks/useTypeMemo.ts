import { useMemo } from "react";

import type TreeHelper from "../../../utils/tree-helper";
import { treeFromJson } from "../../../utils/tree-helper";
import { TreeNodeEntry } from "../../../utils/tree-helper.types";

export type ReducedTypeMemo = {
  admins: Array<any>;
  countries: Array<any>;
  rests: Array<any>;
  settlements: Array<any>;
  total: number;
};

export type TypeMemo = {
  hiddenTypes: Array<number>;
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

const hiddenTypes = [634, 5107, 82794, 6256]; // planet continent region country

const useTypeMemo = (
  tree: TreeHelper | undefined,
  typeTree: TreeHelper | undefined,
  //
  selectedTypeId: number | undefined,
  //
  topTypeResultsLength: number
) => {
  const isTreeReady = tree && typeTree;
  //
  const allTypesWithPath = useMemo(() => {
    if (!typeTree) return [];
    if (!tree) return [];
    //
    const allTypes = typeTree.list_all(); // [  {code: 24017414, name: 'MISC', p: 3, type: 24017414} , ... ]
    const allTypesWithPathHavingInstances = allTypes
      .map((t) => ({
        ...t,
        path: typeTree.get_pnames(t).replace("ROOT", ""),
        count: tree.typeSize(t.code),
      }))
      .filter((t) => t.count > 0 && t.code !== 6256)
      .sort((a, b) => b.count - a.count);
    //
    return allTypesWithPathHavingInstances;
  }, [tree, typeTree]);

  //
  // Grouping type information
  //
  const typeMemo: TypeMemo | undefined = useMemo(
    () => {
      if (isTreeReady && typeTree && tree) {
        const useAllNodes = true;
        const memo = getTypeTreeGroups(typeTree, useAllNodes);
        const { rest, used } = memo.ids;
        const memoIds = [...rest, ...used].sort((a, b) => a - b);
        //
        // console.log("memo ids", memoIds);  -- all type ids
        //
        const types = tree.list_by_type();
        const instancedTypeIds = Object.keys(types).map((s: string) =>
          parseInt(s)
        );
        //
        const knownIds = instancedTypeIds
          .map((t: number) => [t, memoIds.includes(t)])
          .filter(([t, b]) => Boolean(b))
          .map(([type]) => Number(type));
        const unknownIds = instancedTypeIds
          .map((t: number) => [t, memoIds.includes(t)])
          .filter(([t, b]) => !Boolean(b))
          .map(([type]) => Number(type));

        //
        // known: ids and count
        //
        const knownIdsWithCount = knownIds
          .map((id) => [id, typeTree._find(id)] as [number, TreeNodeEntry])
          .filter(([id, n]) => n !== undefined)
          .map(([id, n]) => {
            if (n === undefined) return { t: id, label: "", count: 0, pns: "" };
            //
            return {
              t: id,
              label: n.name ?? "",
              count: tree.typeSize(id),
              pns: typeTree.get_pnames(n),
            };
          })
          .sort((a, b) => b.count - a.count);
        const knownInstanceCount = knownIdsWithCount
          .map((t) => t.count)
          .reduce((a, b) => a + b, 0);

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

        //
        // console.log("instance ids", instancedTypeIds);
        // console.log("unknown ids", unknownIds);
        // console.log("known ids", knownIds);
        // console.log("known ids", knownIdsWithCount);
        // console.log("known instances", knownInstanceCount);
        // console.log("unknown ids", unknownIdsWithCount);
        // console.log("unknown instances", unknownInstanceCount);
        //
        const totalCount = knownInstanceCount + unknownInstanceCount;
        const coverage = `${(knownInstanceCount / (0.01 * totalCount)).toFixed(
          2
        )}%`;
        //
        console.log("type coverage", coverage, " of instances");
        //
        // creating reduced memo from memo
        //
        const reduceMemo = () => {
          const { countries, admins, settlements, rest } = memo;
          //
          const getInstanceCount = (type: number) => tree.typeSize(type);
          const hasInstance = (type: number) => getInstanceCount(type) > 0;
          //
          const countriesUsed = countries.filter(([t]) =>
            hasInstance(t as number)
          );
          const adminsUsed = admins.filter(([t]) => hasInstance(t as number));
          const settlementsUsed = settlements.filter(([t]) =>
            hasInstance(t as number)
          );
          const restsUsed = rest.filter(([t]) => hasInstance(t as number));
          //
          // sorting ids by number of instances descending
          //
          const byInstancesDesc = ([atype]: Array<any>, [btype]: Array<any>) =>
            getInstanceCount(btype) - getInstanceCount(atype);
          countriesUsed.sort(byInstancesDesc);
          adminsUsed.sort(byInstancesDesc);
          settlementsUsed.sort(byInstancesDesc);
          restsUsed.sort(byInstancesDesc);
          //
          // console.log("Reduced", countries.length, "->", countriesUsed.length);
          // console.log("Reduced", admins.length, "->", adminsUsed.length);
          // console.log( "Reduced", settlements.length, "->", settlementsUsed.length );
          // console.log( "Rest", rest.length, "->", restsUsed.length);
          //
          const a = [countriesUsed, adminsUsed, settlementsUsed, restsUsed];
          const total = a.map((arr) => arr.length).reduce((a, b) => a + b, 0);
          //
          // console.log("usedIds", usedIds, "unknownIds", unknownIds);
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
          hiddenTypes,
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

  //
  //
  //
  const typeGraphData = useMemo(() => {
    if (typeMemo && typeTree && tree) {
      const instances = tree.list_by_type();
      //
      const excludeRoot = (n: any) => n.id !== "3";
      const renderRawLink = (n: any) => ({
        source: `${n.id}`,
        target: `${n.p}`,
      });
      const renderLink = (n: any) => ({
        source: `${n.id}`,
        target: `${n.p}`,
        value: n.count,
        label: n.name,
      });
      const renderNode = (n: any) => ({ ...n, name: `${n.name} (${n.count})` });
      //
      // clone nodes of type tree
      //
      const clones = treeFromJson(typeTree.toJson());
      const _nodes = [] as Array<any>;
      //
      clones.NODES.forEach((node) => {
        _nodes.push({
          id: String(node.code),
          group: String(node.p),
          ...node,
        });
      });
      //
      const _links = _nodes.filter(excludeRoot).map(renderRawLink);
      //
      const allTargets = Array.from(new Set(_links.map((l) => l.target)))
        .map((s) => parseInt(s))
        .sort((a, b) => a - b);
      const leafs = _nodes.filter((n) => !allTargets.includes(parseInt(n.id)));
      const leafIds = leafs.map((n) => n.id);
      //
      const nodesWithCount = _nodes.map((n) => ({
        ...n,
        count: (instances[String(n.id)] || []).length,
      }));
      //
      const renderedNodes = nodesWithCount.map(renderNode);
      const renderedLinks = renderedNodes.filter(excludeRoot).map(renderLink);
      //
      // consider adding:     { source: String(24017414), target: "3" }, // MISC NODE
      //
      const graphData = {
        nodes: [...renderedNodes] as Array<Record<string, any>>,
        links: [...renderedLinks] as Array<{ source: string; target: string }>,
      };
      //
      /*
      console.log("nodes", _nodes, "links", _links);
      console.log("allTargets", allTargets);
      console.log("leafs", leafs);
      console.log("leafIds", leafIds);
      console.log("nodesWithCount", nodesWithCount);
      //
      console.log("Type Graph ready", graphData, leafIds.length, "leaf nodes");
      */
      //
      return graphData;
    }
    //
    return { nodes: [], links: [] };
  }, [typeMemo, tree, typeTree]);

  //
  // Type level - top 10 matching single type
  //
  const topTypeCities = useMemo(() => {
    if (tree && typeTree && isTreeReady) {
      const all = tree.list_all();
      //
      // TODO: (strict / loose)
      //
      const includedTypes = selectedTypeId ? [selectedTypeId] : [];
      const matchingType = all.filter((n) => includedTypes.includes(n.type));
      //
      const populationDesc = (a: any, b: any) => b.data?.pop - a.data?.pop;
      const sortedResult = matchingType.sort(populationDesc);
      //
      return sortedResult.slice(0, topTypeResultsLength);
    }
    //
    return [];
  }, [tree, typeTree, isTreeReady, topTypeResultsLength, selectedTypeId]);

  //
  //
  //
  return useMemo(
    () => ({ allTypesWithPath, typeMemo, topTypeCities, typeGraphData }),
    [allTypesWithPath, typeMemo, topTypeCities, typeGraphData]
  );
};

//
// Helper function to group feature types (country/admin/city/rest)
//
export const getTypeTreeGroups = (tree: TreeHelper, useAllNodes?: boolean) => {
  //const all = tree.getLeafNodes();
  //
  const leafNodes = useAllNodes
    ? tree.list_all()
    : // Object.keys(tree.NODES)
      //     .map((code) => tree._n(String(code)))
      //     .filter((n) => n !== undefined)
      tree.getLeafNodes();
  const leafNodesWithPath = leafNodes.map((node) => [
    node.code,
    tree.get_pcodes(node),
    node.name,
  ]);
  //
  const countryTypeId = 183039; // root-country
  const countryTypes = leafNodesWithPath.filter(
    ([c, chain, n]) => (chain as Array<number>)[1] === countryTypeId
  );
  //
  const admin = 56061; // any-admin
  const adminTypes = leafNodesWithPath.filter(
    ([c, chain, n]) => (chain as Array<number>)[1] === admin
  );
  const settlement = 486972; // human settlement
  const settlementTypes = leafNodesWithPath.filter(
    ([c, chain, n]) => (chain as Array<number>)[1] === settlement
  );
  //
  const allIds = leafNodes.map((node) => node.code);
  const usedIds = [
    ...countryTypes.map((t) => t[0] as number),
    ...adminTypes.map((t) => t[0] as number),
    ...settlementTypes.map((t) => t[0] as number),
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
    restIds.includes(code as number)
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

export default useTypeMemo;
