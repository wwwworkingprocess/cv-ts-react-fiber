import { useCallback, useEffect, useMemo, useState } from "react";

import { getAvailableCountryCodes } from "../utils/country-helper";

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
  load_types,
} from "../utils/networking";

type TreeRawData = {
  hierarchy: Int32Array;
  types: Record<
    string,
    { code: number; name: string; p: number | undefined; type: number }
  >;
  labels: Array<any>;
  nodedata: Array<any>;
};

type LoaderResult = [
  Int32Array,
  Record<
    string,
    { code: number; name: string; p: number | undefined; type: number }
  >,
  Array<[number, string]>,
  Array<TreeNodeNumericProps>
];

type LoaderResultPromises = [
  Promise<Int32Array>,
  Promise<
    Record<
      string,
      { code: number; name: string; p: number | undefined; type: number }
    >
  >,
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
  const [loadStep, setLoadStep] = useState<number>(0);
  const [loadCount, setLoadCount] = useState<number>(0);
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
    setTypeTree(undefined);
    setLoadStep(0);
  };

  const increaseLoadStep = useCallback(() => {
    setTimeout(() => setLoadStep((step) => step + 1), 10);
  }, []);

  //
  // STEP 1 Creating tree instance
  //
  useEffect(() => {
    //
    // STEP 0 Only allow valid countryCode -s to load
    //
    const availableCountryCodes = getAvailableCountryCodes();
    const isAvailable =
      countryCode && availableCountryCodes.includes(countryCode);
    //
    const fn_create_tree = () => new TreeHelper({});
    //
    if (isAvailable) {
      if (countryCode) {
        resetTree();
        //
        setLoading(true);
        setTree(fn_create_tree);
      }
    } else {
      console.log("TREE helper, invalid country code, skipping", countryCode);
    }
    //
    return () => resetTree();
  }, [countryCode]); // reset state when countryCode changes

  //
  // STEP 2 Updating path for each file when countryCode is changing
  //
  const urls = useMemo(() => {
    if (!countryCode) return [];
    //
    const p = path ? `${path}` : "";
    //
    const pathHierarchy = `${p}data/wikidata/${countryCode}.tree.bin`; // using typed (v2)
    const pathTypes = `${p}data/wikidata/${countryCode}.tree.types.json`; // using typed (v2)
    //const pathHierarchy = `${p}data/wikidata/${countryCode}.tree.hierarchy.bin`;
    const pathLabels = `${p}data/wikidata/${countryCode}.tree.labels.json`;
    const pathNodeData = `${p}data/wikidata/${countryCode}.tree.nodedata.bin`;
    //
    return [pathHierarchy, pathTypes, pathLabels, pathNodeData];
  }, [countryCode, path]);

  //
  // STEP 3 Loading tree data files, after path variables are ready
  //
  const updateDataResult = (r: LoaderResult) => {
    const [hierarchy, types, labels, nodedata] = r;
    //
    console.log("in updateDataResult", r);
    setLoadStep(1);
    //
    setDataResult({ hierarchy, types, labels, nodedata } as TreeRawData);
  };
  //
  useEffect(() => {
    //
    const loadTreeData = async (urls: Array<string>) => {
      const [path_hierarchy, path_types, path_labels, path_nodedata] = urls;
      const dataPromises = [
        load_hierarchy(path_hierarchy, fn_blob_to_hierarchy),
        load_types(path_types),
        load_labels(path_labels),
        load_nodedata(path_nodedata, fn_blob_to_nodedata, fn_from_ab),
      ] as LoaderResultPromises;
      //
      setDataLoading(true);
      //
      return await Promise.all(dataPromises)
        .then(updateDataResult)
        .catch((ex) => {
          console.error("ERROR", ex, "in tree");
          setDataResult(undefined);
        })
        .finally(() => {
          setDataLoading(false);
        });
    };
    //
    //
    if (tree && urls.length) loadTreeData(urls);
    //
    return () => {
      setDataResult(undefined);
      setDataLoading(false);
      setLoadStep(0);
    };
  }, [tree, urls]);

  const [typeTree, setTypeTree] = useState<TreeHelper>();
  const updateTypeTree = useCallback(
    (
      types: Record<
        string,
        { code: number; name: string; p: number | undefined; type: number }
      >
    ) => {
      if (types) {
        const tt = new TreeHelper(types, true);
        //
        console.log("tt", tt);
        //
        setTypeTree(tt);
      }
    },
    [setTypeTree]
  );
  //
  // STEP 4 Processing loaded data, building tree nodes
  //
  useEffect(() => {
    const isReady = tree && !dataLoading && dataResult !== undefined;
    //
    if (isReady) {
      const { hierarchy, types, labels, nodedata } = dataResult;
      //
      switch (loadStep) {
        case 1:
          {
            const nodeCount = tree._build_from_flatmap_typed(hierarchy); // creating tree hieararcy (nodes & edges)
            tree.NODES["Q3"].p = undefined; // no better way ATM, consider using p === 0 instead of p === undefined as 'root classifier'
            setLoadCount(nodeCount);
          }
          break;
        case 2:
          tree._build_labels(labels as any); // decorating nodes (localizable)
          break;
        case 3:
          tree._build_nodedata(nodedata); // decorating nodes (numeric data)
          break;
        case 4:
          setKeys(tree._keys_cache); // passing reference of helper-result
          setValue(tree);
          break;
        case 5:
          updateTypeTree(types);
          break;
        case 6:
          setLoading(false);
          break;
      }

      if (loadStep < 6) increaseLoadStep();
      else setLoading(false);
    }
  }, [
    tree,
    dataLoading,
    dataResult,
    updateTypeTree,
    increaseLoadStep,
    loadStep,
    setLoadStep,
  ]);

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
      loadStep,
      loadCount,
      keys,
      tree: value,
      nodes: value?.NODES,
      typeTree: typeTree,
    }),
    [loading, loadStep, loadCount, keys, value, typeTree]
  );
};
