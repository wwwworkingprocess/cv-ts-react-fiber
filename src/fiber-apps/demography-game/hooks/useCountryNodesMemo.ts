import { useCallback, useMemo } from "react";

import TreeHelper from "../../../utils/tree-helper";
import { distance } from "../../../utils/geo";
import { WikiCountry } from "../../../utils/firebase/repo/wiki-country.types";
import { getCountryNodesFromTree } from "../../../utils/country-helper";

const useCountryNodesMemo = (
  selectedCountry: WikiCountry | undefined,
  tree: TreeHelper,
  typeTree: TreeHelper,
  selectedCode: string | undefined,
  selectedTypeId: number | undefined,
  MAX_ITEMS_TO_SHOW: number,
  MAX_RANGE_TO_SHOW: number,
  SORT_ORDER_ASCENDING: boolean
) => {
  const getTreeNode = useCallback((code: string) => tree._n(code), [tree]);
  //
  const nodesWithinCountry = useMemo(
    () => {
      if (!tree) return [];
      if (!selectedCountry) return [];
      //
      // when type filter is active, return all nodes matching type
      //
      const nodes = getCountryNodesFromTree(selectedCountry, tree);
      //
      return selectedTypeId
        ? nodes.filter((n) => n.type === selectedTypeId)
        : nodes;
    },
    //
    [selectedCountry, selectedTypeId, tree]
  );
  //
  const currentSort = useMemo(() => {
    const byPopulationDesc = (na: any, nb: any) =>
      (nb.data?.pop || -2) - (na.data?.pop || -2);
    const byPopulationAsc = (na: any, nb: any) =>
      (na.data?.pop || -2) - (nb.data?.pop || -2);
    //
    return SORT_ORDER_ASCENDING ? byPopulationDesc : byPopulationAsc;
  }, [SORT_ORDER_ASCENDING]);
  //
  const mostPopulatadNodes = useMemo(() => {
    //
    return (
      nodesWithinCountry
        .filter((n) => n.data?.pop || -2 > 0)
        .sort(currentSort)
        //.sort((na, nb) => (nb.data?.pop || -2) - (na.data?.pop || -2))
        .slice(0, MAX_ITEMS_TO_SHOW)
    );
  }, [nodesWithinCountry, currentSort, MAX_ITEMS_TO_SHOW]);
  //
  const nearestNodes = useMemo(() => {
    if (selectedCode) {
      const selectedNode = getTreeNode(selectedCode);
      //
      if (selectedNode) {
        const data = selectedNode.data ?? {};
        const { lat, lng } = data;
        //
        if (!lat || !lng) return [];
        //
        return nodesWithinCountry
          .filter((n) => n.data !== undefined && n.data.lat && n.data.lng)
          .map((n) => ({
            ...n,
            distance: distance(
              [lng, lat],
              [n.data.lng ?? lng, n.data.lat ?? lat] //
            ),
          }))
          .filter((n) => n.distance * 10e-4 <= MAX_RANGE_TO_SHOW)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, MAX_ITEMS_TO_SHOW);
      }
      //
      return [];
    }
    //
    return [];
  }, [
    getTreeNode,
    nodesWithinCountry,
    selectedCode,
    MAX_ITEMS_TO_SHOW,
    MAX_RANGE_TO_SHOW,
  ]);

  const displayedNodes = useMemo(() => {
    if (!selectedCode) {
      return mostPopulatadNodes;
    } else {
      if (nearestNodes.length === MAX_ITEMS_TO_SHOW) return nearestNodes;
      //
      // filling up list with most populated places
      //
      const res = [...nearestNodes];
      const selectedNode = getTreeNode(selectedCode);
      //
      if (selectedNode) {
        const data = selectedNode.data ?? {};
        const { lat, lng } = data;
        //
        const nearestCodesLookup = new Set(nearestNodes.map((n) => n.code));
        //
        let extendedFromPop = 0;
        let next = mostPopulatadNodes[extendedFromPop];
        //
        do {
          const alreadyInResults = !next || nearestCodesLookup.has(next.code);
          //
          if (!alreadyInResults) {
            const [latNext, latLng] = [next.data.lat ?? 0, next.data.lng ?? 0];
            const nextDistance = distance([lat, lng], [latNext, latLng]);
            //
            res.push({ ...next, distance: nextDistance });
          }
          //
          const reachedLimit = res.length >= MAX_ITEMS_TO_SHOW;
          //
          next = !reachedLimit
            ? mostPopulatadNodes[++extendedFromPop]
            : undefined;
        } while (next !== undefined);
        //
        return res.map((r) => ({ ...r, distance: undefined }));
      }
      //
      return res;
    }
  }, [
    getTreeNode,
    mostPopulatadNodes,
    nearestNodes,
    selectedCode,
    MAX_ITEMS_TO_SHOW,
  ]);

  return useMemo(
    () => ({
      nodesWithinCountry,
      nearestNodes,
      mostPopulatadNodes,
      displayedNodes,
      getTreeNode,
    }),
    [
      nodesWithinCountry,
      nearestNodes,
      mostPopulatadNodes,
      displayedNodes,
      getTreeNode,
    ]
  );
};

export default useCountryNodesMemo;
