import { useCallback, useMemo } from "react";

import TreeHelper from "../../../utils/tree-helper";
import { distance } from "../../../utils/geo";

const useCountryNodesMemo = (
  tree: TreeHelper,
  selectedCode: string | undefined,
  MAX_ITEMS_TO_SHOW: number,
  MAX_RANGE_TO_SHOW: number
) => {
  const getTreeNode = useCallback((code: string) => tree._n(code), [tree]);
  //
  const nodesWithinCountry = useMemo(
    () => (tree ? tree.list_all().slice(143) : []), // skip continents and countries except hungary
    //
    [tree]
  );
  //
  const mostPopulatadNodes = useMemo(() => {
    return nodesWithinCountry
      .filter((n) => n.data?.pop || -2 > 0)
      .sort((na, nb) => (nb.data?.pop || -2) - (na.data?.pop || -2))
      .slice(0, MAX_ITEMS_TO_SHOW);
  }, [nodesWithinCountry, MAX_ITEMS_TO_SHOW]);
  //
  const nearestNodes = useMemo(() => {
    if (selectedCode) {
      const selectedNode = getTreeNode(selectedCode);
      //
      if (selectedNode) {
        const data = selectedNode ? selectedNode.data : {};
        const { lat, lng } = data;
        //
        return nodesWithinCountry
          .filter((n) => !n.data || n.data.lat || n.data.lng)
          .map((n) => ({
            ...n,
            distance: distance([lat, lng], [n.data.lat ?? 0, n.data.lng ?? 0]),
          }))
          .filter((n) => n.distance * 10e-4 <= MAX_RANGE_TO_SHOW)
          .sort((a, b) => a.distance - b.distance);
      }
      //
      return [];
    }
    //
    return [];
  }, [getTreeNode, nodesWithinCountry, selectedCode, MAX_RANGE_TO_SHOW]);

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
        const data = selectedNode ? selectedNode.data : {};
        const { lat, lng } = data;
        //
        const nearestCodesLookup = new Set(nearestNodes.map((n) => n.code));
        //
        let extendedFromPop = 0;
        let next = mostPopulatadNodes[extendedFromPop];
        //
        while (res.length < MAX_ITEMS_TO_SHOW || !next) {
          const alreadyInResults = next
            ? nearestCodesLookup.has(next.code)
            : true;
          //
          if (!alreadyInResults)
            res.push({
              ...next,
              distance: distance(
                [lat, lng],
                [next.data.lat ?? 0, next.data.lng ?? 0]
              ),
            });
          //
          extendedFromPop++;
          next = mostPopulatadNodes[extendedFromPop];
        }
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
