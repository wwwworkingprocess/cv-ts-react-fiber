export type TreeNodeNumericProps = {
  id: number | undefined;
  p: number | undefined;
  c: number | undefined;
  pop: number | undefined;
  km2: number | undefined;
  lat: number | undefined;
  lng: number | undefined;
};

export type TreeNodeEntry = {
  code: number;
  name: string;
  p: number | undefined; //parent.code,
  type: number;
  data?: any; //TODO: create from TreeNodeNumericProps
};

//TODO: use object instead
export type TreeNodeOfDepth = [
  string /* key of node */,
  string /* name of node */,
  number /* parent's numeric code */,
  number /* depth of node in tree */
];

export interface ITreeHelper {
  NODES: Record<string, TreeNodeEntry> | Map<number, TreeNodeEntry>;
  _keys_cache: Array<string>;
  //
  // utility functions
  //
  _n: (k: string) => TreeNodeEntry | undefined; // Retrieve a node by its key (Q28)
  _qc: (n: number) => string; // Convert to a numeric code to a string key (28-> Q28)
  _qq: (s: string) => number; // Convert a string key to a numeric code (Q28-> 28)
  _q: (s: string) => number; // Extract numeric code from wikientry url (http://www.wikidata.org/entity/Q28 -> 28)
  //
  // node insertion
  //
  _rebuild: () => void;
  _node: (
    type: number,
    code: number,
    name: string,
    parent?: TreeNodeEntry
  ) => void;
  //
  size: () => number;
  list_all: () => Array<TreeNodeEntry>;
  _all_of_depth: (lvl: number) => Array<TreeNodeOfDepth>;
  //
  // search or find a node
  //
  _has: (code: number) => boolean;
  _find: (code: number) => TreeNodeEntry | undefined;
  _search: (name: string) => [string, string, number]; // [key, name, parentcode]
  //
  // property accessors for a specific node
  //
  _get_type: (code: number) => number | undefined;
  _get_name: (code: number) => string | undefined;
  _label_of: (code: number) => string | undefined;
  //
  // hierarchical queries
  //
  get_depth: (node: TreeNodeEntry) => number;
  get_pnames: (node: TreeNodeEntry) => string; // Array<string>;
  get_pcodes: (node: TreeNodeEntry) => Array<number>;
  get_types: (node: TreeNodeEntry) => Array<number>;
  //
  _is_leaf: (code: number) => boolean;
  getLeafNodes: () => TreeNodeEntry[];
  _children_of: (code: number) => Array<TreeNodeOfDepth>;
  //
  // exporting data
  //
  toJson: () => string;
  _deserialize: () => Array<number>;
  _deserializeWithTypes: () => Array<number>;
  //
  print_n: (node: TreeNodeEntry) => void;
}

export type GroupedType = [number, Array<number>, string];
export type GroupedTypes = {
  ids: {
    used: Array<number>;
    rest: Array<number>;
  };
  countries: Array<GroupedType>;
  admins: Array<GroupedType>;
  settlements: Array<GroupedType>;
  rest: Array<GroupedType>;
  sizeLeaf: number;
  sizeTotal: number;
};
