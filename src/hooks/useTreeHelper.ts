import { useEffect, useMemo, useState } from "react";

import TreeHelper, {
  fn_from_ab,
  fn_blob_to_hierarchy,
  fn_blob_to_nodedata,
} from "../utils/tree-helper";
import type { TreeNodeNumericProps } from "../utils/tree-helper";

import {
  load_hierarchy,
  load_labels,
  load_nodedata,
} from "../utils/networking";

type TreeRawData = {
  hierarchy: Int32Array;
  labels: Array<any>;
  nodedata: Array<any>;
};

type LoaderResult = [
  Int32Array,
  Array<[number, string]>,
  Array<TreeNodeNumericProps>
];

type LoaderResultPromises = [
  Promise<Int32Array>,
  Promise<Array<[number, string]>>,
  Promise<Array<TreeNodeNumericProps>>
];

//
// Use hierarchical population & geodata for a specific country
//
export const useTreeHelper = (
  countryCode: string | undefined, // e.g. Q28, Q215, Q218
  path?: string | undefined
) => {
  //
  // COUNTRY CODE >> URLS >> PROMISES >> LOADERRESULT >> VALUE
  //
  const [loading, setLoading] = useState<boolean>(false);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [dataResult, setDataResult] = useState<TreeRawData>();
  const [tree, setTree] = useState<TreeHelper>();
  const [keys, setKeys] = useState<Array<string>>([]);
  //
  const resetTree = () => {
    setLoading(false);
    setDataLoading(false);
    setDataResult(undefined);
    setTree(undefined);
    setKeys([]);
    setValue(undefined);
  };

  //
  // STEP 1 Creating tree instance
  //
  useEffect(() => {
    const fn_create_tree = () => new TreeHelper({});
    //
    if (countryCode) {
      resetTree();
      //
      setLoading(true);
      setTree(fn_create_tree);
    }
    //
    return () => resetTree();
  }, [countryCode]); // reset state when countryCode changes

  //
  // STEP 2 Updating path for each file when countryCode is changing
  //
  const urls = useMemo(() => {
    const p = path ? `${path}` : "";
    //
    const pathHierarchy = `${p}data/wikidata/${countryCode}.tree.hierarchy.bin`;
    const pathLabels = `${p}data/wikidata/${countryCode}.tree.labels.json`;
    const pathNodeData = `${p}data/wikidata/${countryCode}.tree.nodedata.bin`;
    //
    return [pathHierarchy, pathLabels, pathNodeData];
  }, [countryCode, path]);

  //
  // STEP 3 Loading tree data files, after path variables are ready
  //
  const updateDataResult = (r: LoaderResult) => {
    const [hierarchy, labels, nodedata] = r;
    //
    setDataResult({ hierarchy, labels, nodedata } as TreeRawData);
  };
  //
  useEffect(() => {
    //
    const loadTreeData = async (urls: Array<string>) => {
      const [path_hierarchy, path_labels, path_nodedata] = urls;
      const dataPromises = [
        load_hierarchy(path_hierarchy, fn_blob_to_hierarchy),
        load_labels(path_labels),
        load_nodedata(path_nodedata, fn_blob_to_nodedata, fn_from_ab),
      ] as LoaderResultPromises;
      //
      setDataLoading(true);
      //
      return await Promise.all(dataPromises)
        .then(updateDataResult)
        .finally(() => setDataLoading(false));
    };
    //
    //
    if (tree) loadTreeData(urls);
  }, [tree, urls]);

  //
  // STEP 4 Processing loaded data, building tree nodes
  //
  useEffect(() => {
    const isReady = tree && !dataLoading && dataResult !== undefined;
    //
    if (isReady) {
      const { hierarchy, labels, nodedata } = dataResult;
      //
      tree._build_from_flatmap(hierarchy); // creating tree hieararcy (nodes & edges)
      tree.NODES["Q3"].p = undefined; // no better way ATM, consider using p === 0 instead of p === undefined as 'root classifier'
      //
      tree._build_labels(labels as any); // decorating nodes (localizable)
      tree._build_nodedata(nodedata); // decorating nodes (numeric data)
      //
      setKeys(tree._keys_cache); // passing reference of helper-result
      setValue(tree);
      setLoading(false);
    }
  }, [tree, dataLoading, dataResult]);

  //
  // Returning memoized result
  //
  const val = useMemo(
    () =>
      !loading && !dataLoading && dataResult && keys.length > 0
        ? tree
        : undefined,
    [tree, loading, dataLoading, dataResult, keys]
  );
  const [value, setValue] = useState<TreeHelper | undefined>(val);
  //
  return useMemo(
    () => ({
      loading,
      keys,
      tree: value,
      nodes: value?.NODES,
    }),
    [loading, keys, value]
  );
};
