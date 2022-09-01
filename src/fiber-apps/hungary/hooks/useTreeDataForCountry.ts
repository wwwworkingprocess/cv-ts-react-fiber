import { useMemo } from "react";
import { useTreeHelper } from "../../../hooks/useTreeHelper";

export const useTreeDataForCountry = (
  countryCode: string,
  minPop?: number,
  maxPop?: number
) => {
  //
  const { loading, tree, keys, nodes } = useTreeHelper(countryCode);
  //

  //
  // city data memo
  //
  const cMemo = useMemo(() => {
    if (tree && keys) {
      const all = tree.list_all();
      const located = all.filter((x) => x.data !== undefined);
      //
      const filtered = located.filter(
        (x) =>
          (minPop ?? 100) < x.data?.pop && x.data?.pop < (maxPop ?? 1000000)
      );
      //
      const mapped = filtered.map((x) => ({
        parent: Number(x.p),
        name: String(x.name),
        code: Number(x.code),
        coords: [x.data.lat, x.data.lng] as [number, number],
        pop: Number(x.data.pop),
      }));
      //
      return mapped;
    } else return [];
  }, [tree, keys, minPop, maxPop]);
  //

  return useMemo(
    () => ({ loading, tree, keys, nodes, cMemo }),
    [loading, tree, keys, nodes, cMemo]
  );
};
