import { useCallback, useEffect, useMemo, useState } from "react";

import { Buffer } from "buffer";

import type { TreeNodeNumericProps } from "../utils/tree-helper.types";
import { unzipBufferMulti } from "../utils/deflate";

import TreeHelper, { fn_from_ab } from "../utils/tree-helper";

import { load_zipfile } from "../utils/networking";

import { getAvailableCountryCodes } from "../config/country";

type TreeRawData = {
  hierarchy: Int32Array;
  types: Record<
    string,
    { code: number; name: string; p: number | undefined; type: number }
  >;
  labels: Array<[number, string]>;
  nodedata: Array<TreeNodeNumericProps>;
};

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
  // URLS >> DOWNLOAD_RESULT >> INFLATED >> DATARESULT
  //
  const [downloadPath, setDownloadPath] = useState<string>(); // download compressed data from this url
  const [downloadResult, setDownloadResult] = useState<ArrayBuffer>(); // target arraybuffer for downloading
  const [inflatedResult, setInflatedResult] = useState<
    Record<string, ArrayBuffer>
  >({}); // storing decompressed data before deserializing ( Array<ArrayBuffer> -> TreeRawData )
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
    //
    setDownloadPath("");
    setDownloadResult(undefined);
    setInflatedResult({});
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
    const p = path ? `${path}` : "";
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
        setDownloadPath(`${p}data/wikidata/zip/${countryCode}.tree.zip`);
        setTree(fn_create_tree);
      }
    } else {
      console.log("TREE helper, invalid country code, skipping", countryCode);
    }
    //
    return () => resetTree();
  }, [path, countryCode]); // reset state when countryCode changes

  //
  // STEP B-1 Download compressed document (async)
  //
  useEffect(() => {
    if (downloadPath) {
      load_zipfile(downloadPath).then((compressed: ArrayBuffer) => {
        console.log("loaded compressed", compressed);
        //
        setDownloadResult(compressed);
      });
    }
    //
    //
    //
    return () => setDownloadResult(undefined);
  }, [downloadPath]);

  //
  // STEP B-2 Inflate compressed document (async)
  //
  useEffect(() => {
    if (downloadResult) {
      const decompress = async (ab: ArrayBuffer) => {
        const { files, results } = await unzipBufferMulti(ab); // opening archive
        const inflated = await results; // unzipping every 'result' of every 'file'
        const ok = inflated.length === 4;
        //
        //
        const entries = ok ? files.map((f, idx) => [f, inflated[idx]]) : [];
        const result = Object.fromEntries(entries);
        //
        console.log("RESULT", result);
        //
        setInflatedResult(result); //TODO:  consider undefined for not ok
      };
      //
      decompress(downloadResult); // async
    }
    //
    //
    return () => setInflatedResult({});
  }, [downloadResult]);

  //
  // STEP B-3 Set Dataresult from inflated
  //
  useEffect(() => {
    if (Object.keys(inflatedResult).length) {
      const transform = (obj: Record<string, ArrayBuffer>) => {
        //
        // Reading arraybuffers from input
        //
        const ab_hierarchy = obj["index.bin"] ?? new ArrayBuffer(0);
        const ab_types = obj["types.json"] ?? new ArrayBuffer(0);
        const ab_labels = obj["labels.json"] ?? new ArrayBuffer(0);
        const ab_nodedata = obj["data.bin"] ?? new ArrayBuffer(0);
        //
        // Transform arraybuffers to target types ({ hierarchy, types, labels, nodedata } as TreeRawData)
        // Output types of entries:
        //
        // 1. hierarchy (index.bin) --> Int32Array
        // 2. type tree (types.json) --> Record<string, { code: number; name: string; p: number | undefined; type: number }>
        // 3. localization data (labels.json)  -->  Array<[number, string]>
        // 4. Node numeric data properties (nodes.bin) -> Array<TreeNodeNumericProps>
        //

        //
        // 1. hierarchy (index.bin)
        //
        const buffer_to_hierarchy = (buffer: Buffer): Int32Array => {
          if (buffer.length === 0) return new Int32Array(0); //TODO: consider undefined
          //
          const view = new DataView(buffer.buffer);
          //
          const l = buffer.length / 4;
          const int32 = new Int32Array(l);
          let loaded = 0;
          //
          for (let i = 0; i < buffer.length; i += 4) {
            int32[loaded] = view.getInt32(i, true);
            //
            loaded++;
          }
          //
          return int32;
        };
        //
        const hierarchy = buffer_to_hierarchy(Buffer.from(ab_hierarchy));
        //
        const decoder = new TextDecoder("utf-8");
        //
        // 2. type tree (types.json)
        //
        const typesString = decoder.decode(ab_types);
        const types = (typesString ? JSON.parse(typesString) : {}) as Record<
          string,
          {
            code: number;
            name: string;
            p: number;
            type: number;
          }
        >;
        //
        // 3. localization data (labels.json)
        //
        const labelsString = decoder.decode(ab_labels);
        const labels = (labelsString ? JSON.parse(labelsString) : []) as Array<
          [number, string]
        >;
        //
        // 4. Node numeric data properties (nodes.bin)
        //
        const blob_to_nodedata = (buffer: any): Array<Uint8Array> => {
          const nodedata = [] as Array<Uint8Array>;
          const byteArray = new Uint8Array(buffer);
          //
          for (let i = 0; i < byteArray.byteLength; i += 28) {
            nodedata.push(byteArray.slice(i, i + 28));
          }
          //
          return nodedata;
        };
        //
        const nodedata = blob_to_nodedata(ab_nodedata).map(
          (stripe: Uint8Array) =>
            fn_from_ab(stripe.buffer) as TreeNodeNumericProps
        );
        //
        // composing entries into a single object (TreeRawData)
        //
        return { hierarchy, types, labels, nodedata } as TreeRawData;
      };
      //
      const result = transform(inflatedResult);
      //
      setLoadStep(1);
      setDataResult(result);
    }
    //
    //
    return () => {
      setLoadStep(0);
      setDataResult(undefined);
    };
  }, [inflatedResult]);

  //
  // Creating type tree, once decompressed data is ready  (loadStep 5)
  //
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
            //tree.NODES["Q3"].p = undefined; // no better way ATM, consider using p === 0 instead of p === undefined as 'root classifier'
            const root = tree.NODES.get(3);
            if (root) root.p = undefined;
            //
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
          const vals = tree.NODES;
          const keys_cache = [] as Array<string>;
          //
          vals.forEach((val, key, map) => {
            keys_cache.push(`Q${key}`);
          });

          //
          setKeys(keys_cache); //  // passing reference of helper-result
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
