//
// buffer to ndode
//
export const fn_from_ab = (buffer: ArrayBufferLike) => {
  const view = new DataView(buffer); // console.log(['fn_from_ab received', buffer]); console.log(['view', view]);
  let id, p, c, pop, km2, lat, lng;
  //
  try {
    id = view.getInt32(0);
  } catch (ex) {
    console.log(ex);
  }
  try {
    p = view.getInt32(4);
  } catch (ex) {
    console.log(ex);
  }
  try {
    c = view.getInt32(8);
  } catch (ex) {
    console.log(ex);
  }
  try {
    pop = view.getInt32(12);
  } catch (ex) {
    console.log(ex);
  }
  try {
    km2 = view.getInt32(16);
  } catch (ex) {
    console.log(ex);
  }
  try {
    lat = view.getFloat32(20);
  } catch (ex) {
    console.log(ex);
  }
  try {
    lng = view.getFloat32(24);
  } catch (ex) {
    console.log(ex);
  }
  //
  return { id, p, c, pop, km2, lat, lng };
};
//

//
//
//
export const fn_blob_to_hierarchy = (event: any) =>
  new Int32Array(event.target.result);
//
//
//
export const fn_blob_to_nodedata = (event: any) => {
  const nodedata = [],
    byteArray = new Uint8Array(event.target.result); // console.log(byteArray); console.log(byteArray.byteLength); console.log(byteArray.byteLength / 28);
  //
  for (let i = 0; i < byteArray.byteLength; i += 28) {
    nodedata.push(byteArray.slice(i, i + 28));
  }
  //
  return nodedata;
};

class TreeHelper {
  NODES;
  //
  _keys_cache = [] as Array<string>; //Object.keys(NODES);
  //
  constructor(nodes: Record<string, any>) {
    this.NODES = nodes;
    this.NODES["Q3"] = { code: 3, name: "Earth" };
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
  _find = (code: number) => {
    //   console.log(Object.keys(this.NODES));
    return this.NODES[this._qc(code)] || undefined;
  };
  //_find = (code) => { return this.NODES[this._qc(code)]; };
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
    this.NODES[this._qc(code)] = { code, name, p: parent.code, type };
  };
  _rebuild = () => {
    this._keys_cache = Object.keys(this.NODES);
    console.log(this._keys_cache.length + " keys");
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
    this._rebuild(); //validate: console.log(tree._deserialize());
  };
  //
  _build_labels = (labels: Array<any>) => {
    const bound = labels.map((pair) => [pair[0], pair[1], this._find(pair[0])]);
    const failed = bound.filter((x) => x[2] === undefined);
    const ok = bound
      .filter((x) => x[2] !== undefined)
      .map((x) => {
        x[2].name = x[1];
        //
        return x;
      });
    //
    console.log(["NAMED ", bound.length, "items ", ok.length, " ok."]);
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
        const { id, p, lat, lng, pop, km2 } = x[0];
        x[1].data = { lat, lng, pop, km2 };
      });
    //
    console.log(["LINKED ", bound?.length, "items ", ok?.length, " ok."]);
    //
    return failed;
  };
  //
  get_pnames = (node: any): string => {
    let n = this.NODES["Q" + node.p],
      end = !n || n.p === undefined;
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
    return !end ? [...this.get_pcodes(n), node.code] : [n.code, node.code];
  };
  //
  get_types = (node: any): Array<number> => {
    let n = this.NODES[this._qc(node.p)],
      end = !n || n.p === undefined;
    //
    return !end ? [...this.get_types(n), node.type] : [n.type, node.type];
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
      console.log(node);
      console.log(this.get_pnames(node));
      console.log(this.get_pcodes(node));
    } else {
      console.log("node was null");
    }
  };
  //
  list_all = () => {
    this._rebuild();
    return this._keys_cache.map((key) => this.NODES[key]);
  };
}

export default TreeHelper;
