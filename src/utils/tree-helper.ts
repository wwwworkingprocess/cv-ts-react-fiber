//
// buffer to ndode

import { distance } from "./geo";

export type TreeNodeNumericProps = {
  id: number | undefined;
  p: number | undefined;
  c: number | undefined;
  pop: number | undefined;
  km2: number | undefined;
  lat: number | undefined;
  lng: number | undefined;
};
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

//
//
//
class TreeHelper {
  NODES;
  //
  _keys_cache = [] as Array<string>; //Object.keys(NODES);
  //
  constructor(nodes: Record<string, any>) {
    this.NODES = nodes;
    this.NODES["Q3"] = { code: 3, name: "Earth", p: undefined, type: 634 };
    this._rebuild(); // = [], //Object.keys(NODES);
  }
  //
  _n = (k: string) => this.NODES[k];
  _q = (s: string) => {
    return !s
      ? -1
      : parseInt(s.replace("http://www.wikidata.org/entity/Q", ""));
  };
  _qc = (n: number) => {
    return ["Q", n].join("");
  };
  _qq = (s: string) => parseInt(s.replace("Q", ""));
  //
  _has = (code: number) => this.NODES.hasOwnProperty(this._qc(code));
  _find = (code: number) => this.NODES[this._qc(code)] || undefined;
  //
  _get_type = (code: number) => this._find(code).type;
  _get_name = (code: number) => this._find(code).name;
  _search = (name: string) =>
    name
      ? this._keys_cache
          .map((k) => [k, this._n(k).name, this._n(k).p])
          .filter((arr) => arr[1] === name)[0]
      : undefined;
  //
  _node = (type: number, code: number, name: string, parent = { code: 3 }) => {
    // console.log("ADD_NODE", code, name, parent.code);
    this.NODES[this._qc(code)] = { code, name, p: parent.code, type };
  };
  _rebuild = () => {
    this._keys_cache = Object.keys(this.NODES);
  };
  //
  _label_of = (code: number) => (this._find(code) || {}).name;
  _children_of = (code: number) =>
    this._keys_cache
      .map((k) => [k, this._n(k).name, this._n(k).p])
      .filter((arr) => arr[2] === code);
  _is_leaf = (code: number) =>
    this._keys_cache
      .map((k) => [k, this._n(k).name, this._n(k).p])
      .filter((arr) => arr[2] === code).length === 0;
  _all_of_depth = (lvl: number) =>
    this._keys_cache
      .map((k) => [
        k,
        this._n(k).name,
        this._n(k).p,
        this.get_depth(this._n(k)),
      ])
      .filter((arr) => arr[3] === lvl);
  _deserialize = () =>
    this._keys_cache.map((k) => [this._n(k).code, this._n(k).p]).flat();
  //
  _build_from_flatmap = (edges: any) => {
    const def_name = "node_name",
      offset = !this._has(3) ? 2 : 0; // todo check this
    const to_proc =
      offset === 0
        ? edges
        : edges.filter((v: number, i: number) => i >= offset);
    //
    for (let i = offset; i < to_proc.length; i += 2) {
      const id = to_proc[i],
        pid = to_proc[i + 1];
      //
      this._node(-1, id, def_name, { code: pid });
    }
    //
    this._rebuild();
  };
  //
  _build_labels = (labels: Array<any>) => {
    const bound = labels.map((pair) => [pair[0], pair[1], this._find(pair[0])]);
    const failed = bound.filter((x) => x[2] === undefined);
    //
    bound
      .filter((x) => x[2] !== undefined)
      .forEach((x) => {
        x[2].name = x[1];
      });
    //
    return failed;
  };
  //
  _build_nodedata = (nodedata: any) => {
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
  };
  //
  get_pnames = (node: any): string => {
    let n = this.NODES["Q" + node.p],
      end = !n || n.p === undefined;
    //
    console.log("get_pnames", node.id);
    //
    return !end
      ? [this.get_pnames(n), node.name].join(" >> ")
      : [n.name, node.name].join(" >> ");
  };
  //
  get_pcodes = (node: any): Array<number> => {
    let n = this.NODES[this._qc(node.p)],
      end = !n || n.p === undefined;
    //
    if (!n) console.warn("invalid node parent", node.p, node, n);
    //
    return !n
      ? []
      : !end
      ? [...this.get_pcodes(n), node.code]
      : [n.code, node.code];
  };
  //
  get_types = (node: any): Array<number> => {
    let n = this.NODES[this._qc(node.p)],
      end = !n || n.p === undefined;
    //
    return !n
      ? []
      : !end
      ? [...this.get_types(n), node.type]
      : [n.type, node.type];
  };
  //
  get_depth = (node: any): number => {
    const is_root = node.code === 3,
      n = !is_root ? this._find(node.p) : null,
      end = !n || n.p === undefined;
    return is_root ? 0 : !end ? this.get_depth(n) + 1 : 0 + 1;
  };
  //
  print_n = (node: any) => {
    if (node) {
      console.info(node);
      console.info(this.get_pnames(node));
      console.info(this.get_pcodes(node));
    } else {
      console.info("node was null");
    }
  };
  //
  list_all = () => {
    this._rebuild();
    return this._keys_cache.map((key) => this.NODES[key]);
  };
}

export default TreeHelper;
