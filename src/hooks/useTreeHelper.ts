import { useCallback, useEffect, useMemo, useState } from "react";
import {
  load_hierarchy,
  load_labels,
  load_nodedata,
} from "../utils/networking";
import TreeHelper, {
  fn_blob_to_hierarchy,
  fn_blob_to_nodedata,
  fn_from_ab,
} from "../utils/tree-helper";

//
//
//
export const useTreeHelper = (countryCode: string) => {
  //
  // COUNTRY CODE >> URLS >> PROMISES >> DATA
  //

  const [loading, setLoading] = useState<boolean>();
  const [tree, setTree] = useState<TreeHelper>();
  const [keys, setKeys] = useState<Array<string>>([]);
  //
  const urls = useMemo(() => {
    const path_hierarchy = `data/wikidata/Q${countryCode}.tree.hierarchy.bin`;
    const path_labels = `data/wikidata/Q${countryCode}.tree.labels.json`;
    const path_nodedata = `data/wikidata/Q${countryCode}.tree.nodedata.bin`;
    //
    return [path_hierarchy, path_labels, path_nodedata];
  }, [countryCode]);

  //
  // STEP 1 create the tree
  //
  useEffect(() => {
    //
    // resetting state
    //
    setLoading(true);
    setTree(undefined);
    setKeys([]);
    //
    const fn_create_tree = () => new TreeHelper({});
    //
    setTree(fn_create_tree);
  }, [countryCode]); // reset state when countryCode changes

  //
  // STEP 3 processing loaded data
  //
  const afterDataLoaded = useCallback(
    (loaded: Array<any>) => {
      if (!tree) return;
      //
      // initializing tree from loaded data
      //
      const [hierarchy_flatmap, labels, nodedata] = loaded; //console.log(loaded); //console.log('LOADED:'); console.log([hierarchy_flatmap, labels, nodedata]);
      //
      tree._build_from_flatmap(hierarchy_flatmap);
      tree.NODES["Q3"].p = undefined; // no better way ATM, consider using p === 0 instead of p === undefined as 'root classifier'
      const failed_lbl = tree._build_labels(labels as any);
      const failed_data = tree._build_nodedata(nodedata);

      //
      //
      //
      console.log("FAILED LABELS", failed_lbl);
      console.log(failed_data.map((x: Array<any>) => x[0]));
      //
      const nodes = tree.list_all(); //nodes.map(x => { try { console.log([x, x.code, tree.get_pnames(x)]); } catch (ex) { console.log(ex); } });
      const routes = nodes.map((x: any) => {
        try {
          /*console.log([x, x.code, tree.get_pnames(x)]); */ return tree.get_pnames(
            x
          );
        } catch (ex) {
          console.log("failed at code", x.code, ex);
          return "FAILED " + x.code;
        }
      });
      const str = routes.join("<br/>");
      //
      const population = tree._keys_cache
        .map((k: string) => tree.NODES[k])
        .map((node: { code: number; data: any }) => [node.code, node.data])
        .filter((arr: Array<any>) => arr[1] !== undefined);
      //
      console.log(population);
      console.log("str", str);
      //
      //
      //
      const fn_debug_test_q28 = () => {
        tree.print_n(tree._find(789315));
        const test_found = tree._search("Ecser");
        if (test_found) {
          tree.print_n(tree._find(tree._qq(test_found[0])));
        } else {
          console.log("Cannot find [Ecser] in tree.");
        }
        const test_not_found = tree._search("Pécel");
        if (test_not_found) {
          tree.print_n(tree._find(tree._qq(test_not_found[0])));
        } else {
          console.log("Cannot find [Pécel] in tree.");
        }
        //
        const arr = tree._keys_cache
          .map((k: string) => tree.NODES[k])
          .map((n: any): string => n.name)
          .sort((a: string, b: string) => a.localeCompare(b));
        //
        console.log("key cache", arr);
      };
      //
      fn_debug_test_q28();
      //
      setKeys(tree._keys_cache);
      setLoading(false);
    },
    [tree]
  );

  //
  // load tree data after the page is loaded
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

      fn_load_all().then(afterDataLoaded);
    }

    //
    //
    return () => {
      console.log("running tree unmount");
    };
  }, [tree, urls, afterDataLoaded]);

  //
  return { loading, tree, keys, nodes: tree?.NODES, path_hierarchy: urls[0] };
};
