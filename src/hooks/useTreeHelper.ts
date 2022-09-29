import { useCallback, useEffect, useMemo, useState } from "react";

import TreeHelper, {
  fn_blob_to_hierarchy,
  fn_blob_to_nodedata,
  fn_from_ab,
} from "../utils/tree-helper";

import {
  load_hierarchy,
  load_labels,
  load_nodedata,
} from "../utils/networking";

//
// Use hierarchical population & geodata for a specific country
// currently supported countries: Q28, Q36, Q668
//
export const useTreeHelper = (
  countryCode: string,
  path?: string | undefined
) => {
  //
  // COUNTRY CODE >> URLS >> PROMISES >> DATA
  //
  const [loading, setLoading] = useState<boolean>();
  const [tree, setTree] = useState<TreeHelper>();
  const [keys, setKeys] = useState<Array<string>>([]);
  //
  // STEP 1 create the tree
  //
  useEffect(() => {
    setLoading(true);
    setTree(undefined);
    setKeys([]);
    //
    const fn_create_tree = () => new TreeHelper({});
    //
    setTree(fn_create_tree);
  }, [countryCode]); // reset state when countryCode changes
  //
  // STEP 2 update path for each file when countryCode changes
  //
  const urls = useMemo(() => {
    const p = path ? `${path}` : "";

    const path_hierarchy = `${p}data/wikidata/Q${countryCode}.tree.hierarchy.bin`;
    const path_labels = `${p}data/wikidata/Q${countryCode}.tree.labels.json`;
    const path_nodedata = `${p}data/wikidata/Q${countryCode}.tree.nodedata.bin`;
    //
    return [path_hierarchy, path_labels, path_nodedata];
  }, [countryCode, path]);
  //
  // STEP 4 processing loaded data
  //
  const afterDataLoaded = useCallback(
    (loaded: Array<any>) => {
      if (!tree) return;
      //
      // initializing tree from loaded data
      //
      const [hierarchy_flatmap, labels, nodedata] = loaded;
      //
      tree._build_from_flatmap(hierarchy_flatmap); // creating tree hieararcy (nodes & edges)
      tree.NODES["Q3"].p = undefined; // no better way ATM, consider using p === 0 instead of p === undefined as 'root classifier'
      //
      tree._build_labels(labels as any); // decorating nodes (localizable)
      tree._build_nodedata(nodedata); // decorating nodes (numeric data)
      //
      setKeys(tree._keys_cache); // passing reference of helper-result
      setLoading(false);
    },
    [tree]
  );
  //
  // STEP 3 load tree data after the page is loaded
  //
  useEffect(() => {
    if (tree) {
      const fn_load_all = async () => {
        const [path_hierarchy, path_labels, path_nodedata] = urls;
        //
        return await Promise.all([
          load_hierarchy(path_hierarchy, fn_blob_to_hierarchy),
          load_labels(path_labels),
          load_nodedata(path_nodedata, fn_blob_to_nodedata, fn_from_ab),
        ]);
      };
      //
      fn_load_all().then(afterDataLoaded);
    }
  }, [tree, urls, afterDataLoaded]);
  //
  return { loading, tree, keys, nodes: tree?.NODES, path_hierarchy: urls[0] };
};
