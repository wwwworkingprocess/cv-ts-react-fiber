//
// buffer to ndode

import { distance } from "./geo";
import {
  ITreeHelper,
  TreeNodeEntry,
  TreeNodeNumericProps,
  TreeNodeOfDepth,
} from "./tree-helper.types";

//
export const fn_from_ab = (buffer: ArrayBufferLike) => {
  const view = new DataView(buffer);
  //
  if (view.byteLength !== 28) return undefined;
  //
  let id, p, c, pop, km2, lat, lng;
  //
  try {
    id = view.getInt32(0);
  } catch (ex) {
    console.error(ex);
  }
  try {
    p = view.getInt32(4);
  } catch (ex) {
    console.error(ex);
  }
  try {
    c = view.getInt32(8);
  } catch (ex) {
    console.error(ex);
  }
  try {
    pop = view.getInt32(12);
  } catch (ex) {
    console.error(ex);
  }
  try {
    km2 = view.getInt32(16);
  } catch (ex) {
    console.error(ex);
  }
  try {
    lat = view.getFloat32(20);
  } catch (ex) {
    console.error(ex);
  }
  try {
    lng = view.getFloat32(24);
  } catch (ex) {
    console.error(ex);
  }
  //
  return { id, p, c, pop, km2, lat, lng } as TreeNodeNumericProps;
};
//
//
//
export const fn_blob_to_hierarchy = (event: any) =>
  new Int32Array(event.target.result);
//
//
//
export const fn_blob_to_nodedata = (event: any) => {
  const nodedata = [];
  const byteArray = new Uint8Array(event.target.result);
  //
  for (let i = 0; i < byteArray.byteLength; i += 28) {
    nodedata.push(byteArray.slice(i, i + 28));
  }
  //
  return nodedata;
};

//
// Find nodes, in proximity of the provided node
// using 'slow' but accurate distance function
//
export const findTreeNodesInRange = (
  tree: TreeHelper | undefined,
  node: any,
  range: number,
  keepFirst: boolean
) => {
  if (!node || !tree) return [];
  //
  const data = node ? node.data : {};
  const { lat, lng } = data;
  //
  const all = tree ? tree.list_all() : [];
  //
  const nodes = all
    .map((n) => ({
      ...n,
      distance: distance([lat, lng], [n.data?.lat ?? 0, n.data?.lng ?? 0]),
    }))
    .filter((n) => n.distance * 10e-4 <= range)
    .sort((a, b) => a.distance - b.distance);
  //
  if (!keepFirst) nodes.shift(); // removing 'selectedCode' as it is closest to itself
  //
  return nodes;
};

// type TreeNodeEntry = {
//   code: number;
//   name: string;
//   p: number | undefined; //parent.code,
//   type: number;
// };

export const treeFromJson = (s: string) => {
  const nodes = JSON.parse(s);
  //
  const skipRootRewrite = true;
  const tree = new TreeHelper(nodes, skipRootRewrite);
  tree._rebuild();
  //
  console.log("Tree loaded", s.length, "bytes");
  //console.log("tree from json", tree.list_all());
  //
  return tree;
};

const skip = () => {};
const _qc = (n: number): string => `Q${n}`;
const _qq = (s: any): number =>
  s && typeof s === "string" ? parseInt(s.replace("Q", "")) : -1;
const _q = (s: string): number =>
  !s ? -1 : parseInt(s.replace("http://www.wikidata.org/entity/Q", ""));
//

export class TreeHelper implements ITreeHelper {
  /*
    V2:
     NODES: using Map<number, TreeNodeEntry> instead of Record<string, TreeNodeEntry>
  */
  NODES = new Map<number, TreeNodeEntry>(); //  {} as Record<string, TreeNodeEntry>;
  //
  PARENT_CODES = new Set<number>();
  //
  _keys_cache = [];
  //
  constructor(nodes: Record<string, TreeNodeEntry>, skipRootRewrite?: boolean) {
    this._init(nodes, skipRootRewrite);
  }
  //
  _init = (nodes: Record<string, TreeNodeEntry>, skipRootRewrite?: boolean) => {
    //
    // inserting entries from provided input
    // overwriting root node when needed
    //
    const type_planet = 634;
    const root = { code: 3, name: "Earth", p: undefined, type: type_planet };
    //
    if (Object.keys(nodes).length > 0) {
      //
      // add each value to the tree
      //
      const entries = Object.entries(nodes);
      //
      entries.forEach(([q, val]) => {
        // console.log("inserting entry", q, val);
        //
        const id = this._qq(q);
        //
        this.NODES.set(id, val);
        //
        if (val.p) {
          //
          // collecting all parent codes, except rootnode's extremal parent
          //
          this.PARENT_CODES.add(val.p);
        }
      });
    }
    //
    if (!skipRootRewrite) this.NODES.set(3, root);
  };
  //
  _n = (k: string): TreeNodeEntry | undefined => this.NODES.get(this._qq(k));
  _qc = _qc;
  _qq = _qq;
  _q = _q;
  _rebuild = skip;
  //
  _node = (
    type: number,
    code: number,
    name: string,
    parent?: TreeNodeEntry | { code: number }
  ) => {
    const entry = { code, name, p: parent?.code, type } as TreeNodeEntry;
    //
    this.NODES.set(code, entry); // this.NODES[this._qc(code)] = entry;
    //
    if (entry.p) this.PARENT_CODES.add(entry.p); // memoizing parents
  };
  //
  size = (): number => this.NODES.size;
  _has = (code: number): boolean => this.NODES.has(code);
  _find = (code: number): TreeNodeEntry | undefined => this.NODES.get(code);
  //
  list_all = (): Array<TreeNodeEntry> => Array.from(this.NODES.values());
  //
  _label_of = (code: number): string | undefined => this._find(code)?.name; // duplicate
  _get_name = (code: number): string | undefined => this._find(code)?.name;
  _get_type = (code: number): number | undefined => this._find(code)?.type;
  //
  get_depth = (node: TreeNodeEntry): number => {
    const is_root = node.code === 3;
    const n = !is_root ? this._find(node.p ?? 0) : null;
    const end = !n || n.p === undefined;
    //
    return is_root ? 0 : !end ? this.get_depth(n) + 1 : 1;
  };
  //
  get_pnames = (node: TreeNodeEntry): string => {
    let n = this._find(node.p ?? 0);
    const end = !n || n.p === undefined;
    //
    return !end
      ? `${n ? this.get_pnames(n) : "???"} >> ${node.name}`
      : `${n ? n.name : "???"} >> ${node.name}`;
  };
  //
  get_pcodes = (node: TreeNodeEntry): Array<number> => {
    let n = this._find(node.p ?? 0);
    const end = !n || n.p === undefined;
    //
    return !end
      ? n
        ? [...this.get_pcodes(n), node.code]
        : [-1, node.code]
      : n
      ? [n.code, node.code]
      : [-1, -1]; // returned for earth
  };
  get_types = (node: TreeNodeEntry): Array<number> => {
    let n = this._find(node.p ?? 0),
      end = !n || n.p === undefined;
    //
    return !end
      ? n
        ? [...this.get_types(n), node.type]
        : [-1, node.type]
      : n
      ? [n.type, node.type]
      : [-1, node.type]; //TODO: consider [0, node.type];
  };
  //
  _deserialize = (): Array<number> => {
    const arr = [] as Array<number>;
    //
    this.NODES.forEach((value, key) => {
      arr.push(value.code, value.p ?? 0); // parent is undefined for rootnode
    });
    //
    return arr;
  };
  //
  _build_from_flatmap_typed = (edges: any) => {
    const def_name = "node_name";
    const offset = !this._has(3) ? 3 : 0;
    const to_proc =
      offset === 0
        ? edges
        : edges.filter((v: number, i: number) => i >= offset);
    //
    let c = 0;
    for (let i = offset; i < to_proc.length; i += 3) {
      const [id, pid, tid] = [to_proc[i], to_proc[i + 1], to_proc[i + 2]];
      //
      this._node(tid, id, def_name, { code: pid });
      //
      c++;
    }
    //
    this._rebuild();
    //
    return c;
  };
  //
  _build_labels = (labels: Array<any>) => {
    labels.forEach((pair) => {
      const [code, label] = pair;
      //
      const node = this._find(code);
      //
      if (node) node.name = label;
      //
      return [];
    });

    // const bound = labels.map((pair) => [pair[0], pair[1], this._find(pair[0])]);
    // const failed = bound.filter((x) => x[2] === undefined);
    // //
    // bound
    //   .filter((x) => x[2] !== undefined)
    //   .forEach((x) => {
    //     x[2].name = x[1];
    //   });
    // //
    // return failed;
  };
  //
  _build_nodedata = (nodedata: any) => {
    const ok = [];
    const failed = [];
    //
    nodedata.forEach((nd: any) => {
      const node = this._find(nd.id);
      //
      if (node) {
        const { lat, lng, pop, km2 } = nd;
        node.data = { lat, lng, pop, km2 };
        //
        ok.push(node);
      } else {
        failed.push(node);
      }
    });
    //
    console.info([
      "LINKED ",
      ok.length + failed.length,
      "items ",
      ok.length,
      " ok.",
    ]);
    //
    return [];
    /*
    const bound = nodedata.map((nd: any) => [nd, this._find(nd.id)]);
    const failed = bound.filter((x: Array<any>) => x[1] === undefined);
    //
    const ok = bound
      .filter((x: Array<any>) => x[1] !== undefined)
      .forEach((x: Array<any>) => {
        const { lat, lng, pop, km2 } = x[0];
        x[1].data = { lat, lng, pop, km2 };
      });
    //
    console.info(["LINKED ", bound?.length, "items ", ok?.length, " ok."]);
    //
    return failed;
    */
  };
  //
  _deserializeWithTypes = (): Array<number> => {
    const arr = [] as Array<number>;
    //
    this.NODES.forEach((value, key) => {
      arr.push(value.code, value.p ?? 0, value.type); // parent is undefined for rootnode
    });
    //
    return arr;
  };
  //
  _is_leaf = (code: number): boolean => {
    //
    // returns true when this node is NOT a parent
    //
    return !this.PARENT_CODES.has(code);
  };
  //
  getLeafNodes = (): Array<TreeNodeEntry> => {
    const arr = [] as Array<TreeNodeEntry>;
    //
    this.NODES.forEach((value, key) => {
      if (this._is_leaf(value.code)) arr.push(value);
    });
    //
    return arr;
  };
  //
  toJson = (): string => {
    const entries = [] as Array<[string, TreeNodeEntry]>;
    //
    this.NODES.forEach((value, key) => entries.push([`Q${key}`, value]));
    //
    const nodes = Object.fromEntries(entries);
    //
    return JSON.stringify(nodes);
  };
  //
  _children_of = (code: number): Array<TreeNodeOfDepth> => {
    const arr = [] as Array<TreeNodeOfDepth>;
    //
    this.NODES.forEach((n, k) => {
      if (n.p === code) {
        arr.push([`Q${k}`, n.name, n.p, this.get_depth(n)] as TreeNodeOfDepth);
      }
    });
    //
    return arr;
  };
  /*





  */
  _all_of_depth = (lvl: number): Array<TreeNodeOfDepth> => {
    const arr = [] as Array<TreeNodeOfDepth>;
    //
    this.NODES.forEach((n, k) => {
      const d = this.get_depth(n);
      //
      if (d === lvl) {
        arr.push([`Q${k}`, n.name, n.p, this.get_depth(n)] as TreeNodeOfDepth);
      }
    });
    //
    return arr;
  };

  _search = (name: string): [string, string, number] => {
    const noResult = ["", "", -1] as [string, string, number];
    //
    let found = false;
    let result = noResult;
    //
    this.NODES.forEach((n, k) => {
      if (!found) {
        const match = n.name === name;
        //
        if (match) {
          result = [`Q${k}`, n.name, n.p] as [string, string, number];
          found = true;
        }
      }
    });
    //
    return result;
  };
  //
  // _is_leaf: (code: number) => boolean;
  // _children_of: (code: number) => TreeNodeOfDepth[];

  // getLeafNodes: () => TreeNodeEntry[];
  // toJson: () => string;
  //_deserialize: () => number[];
  // _deserializeWithTypes: () => number[];
  /*


  


  */
  print_n = (node: TreeNodeEntry) => {
    if (node) {
      console.log(node);
      console.log(this.get_pnames(node));
      console.log(this.get_pcodes(node));
      console.log(this.get_types(node));
    } else {
      console.warn("node was null");
    }
  };
  //
  list_by_type = (): Record<string, Array<any>> => {
    const all = this.list_all();
    //
    const memo = {} as Record<string, Array<any>>;
    //
    for (const node of all) {
      const t = node.type;
      const exists = memo.hasOwnProperty(t);
      //
      if (!exists) memo[t] = [node];
      else memo[t].push(node);
      //
    }

    //
    return memo;
  };
  //
  typeSize = (type: number) => {
    const arr = [] as Array<TreeNodeEntry>;
    //
    this.NODES.forEach((n, k) => {
      if (n.type === type) arr.push(n);
    });
    //
    return arr.length;
  };
  //
}

export default TreeHelper;
