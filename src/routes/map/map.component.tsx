import { Fragment, useMemo, useState } from "react";
import AdminOneList from "../../components/demography/admin-one-list/admin-one-list.component";
import AdminTwoList from "../../components/demography/admin-two-list/admin-two-list.component";

import CountryList from "../../components/demography/country-list/country-list.component";
import SettlementSearch from "../../components/demography/settlement-search/settlement-search.component";
import TreeBreadCrumb from "../../components/demography/tree-bread-crumb/tree-bread-crumb.component";
import WikiItemDetails from "../../components/demography/wiki-item-details/wiki-item-details.component";
// import SvgWorldMap from "../../components/demography/svg-world-map/svg-world-map.component";

import { Spinner } from "../../components/spinner/spinner.component";
import DemographyGame3D from "../../fiber-apps/demography-game/demography-game-3d";
import { useWikiCountries } from "../../fiber-apps/wiki-country/hooks/useWikiCountries";
import { useTreeHelper } from "../../hooks/useTreeHelper";

import { IS_CLOUD_ENABLED } from "../../utils/firebase/provider";
import { WikiCountry } from "../../utils/firebase/repo/wiki-country.types";
import { distance } from "../../utils/geo";
import type TreeHelper from "../../utils/tree-helper";

const availableCountryCodes = ["Q28", "Q36", "Q668"];

type NearbyTreeItemProps = {
  tree: TreeHelper | undefined;
  selectedCode: string | undefined;
  setSelectedCode: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const NearbyTreeItem = (props: NearbyTreeItemProps) => {
  const { tree, selectedCode, setSelectedCode } = props;
  //
  const isReady = tree && selectedCode;
  const node = isReady ? tree._n(selectedCode) : undefined;
  //
  console.log("node", node);
  //
  const [range, setRange] = useState<number>(3);

  //
  const top10 = useMemo(() => {
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
      .filter((n) => n.distance * 10e-4 < range)
      .sort((a, b) => a.distance - b.distance);
    //
    nodes.shift(); // removing 'selectedCode' as it is closest to itself
    //
    return nodes;
  }, [tree, node, range]);
  //
  //
  return tree && selectedCode ? (
    <div>
      {tree._n(selectedCode)?.name}, range
      <input
        type="number"
        value={range}
        style={{ width: "50px", margin: "0px 5px 0px 5px" }}
        onChange={(e) => setRange(parseInt(e.target.value))}
      />{" "}
      km
      <br />
      <br />
      Match: {top10.length}
      <div>
        {top10.map((n, idx) => (
          <div key={n.code}>
            <button onClick={(e) => setSelectedCode(`Q${n.code}`)}>
              {n.code}
            </button>
            {n.name} -- {(n.distance * 10e-4).toFixed(2)} km - {n.data?.pop}
          </div>
        ))}
      </div>
    </div>
  ) : null;
};

const findTreeNodesInRange = (
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

const NearbyToTreeItems = (props: {
  tree: TreeHelper | undefined;
  selectedCode: string | undefined;
}) => {
  const { tree, selectedCode } = props;
  //
  const [codes, setCodes] = useState<Array<string>>(
    // []
    selectedCode ? [selectedCode] : []
  );
  const addCode = (c: string) => !codes.includes(c) && setCodes([...codes, c]);
  const delCode = (c: string) =>
    codes.length > 1 &&
    setCodes([...(codes.filter((code) => code !== c) ?? [])]);
  //
  const [range, setRange] = useState<number>(4);

  const top10 = useMemo(() => {
    if (tree && selectedCode && codes.length) {
      const results = [] as Array<any>;
      //
      for (const c of codes) {
        results.push(...findTreeNodesInRange(tree, tree._n(c), range, true));
      }
      //
      const qs = results.map((r) => r.code);
      //
      // all unique matching items, unsorted
      //
      const uresults = qs
        .filter((v, i, a) => a.indexOf(v) === i)
        .map((q) => results.find((r) => r.code === q));
      //
      // find lat&lng of first point, calc distance from 'origin'
      //
      const firstNode = tree._n(selectedCode);
      //
      const data = firstNode && firstNode.data ? firstNode.data : {};
      const { lat, lng } = data;
      //
      const resultsWithDistance = uresults.map((n) => ({
        ...n,
        distance: distance([lat, lng], [n.data?.lat ?? 0, n.data?.lng ?? 0]),
      }));
      //
      return resultsWithDistance.sort((a, b) => a.distance - b.distance);
    }
    //
    return [];
  }, [tree, selectedCode, codes, range]);

  //
  //
  //
  return tree && selectedCode ? (
    <div>
      Distance from {tree._n(selectedCode)?.name}, range:
      <input
        type="number"
        value={range}
        step={0.1}
        style={{ width: "50px", margin: "0px 5px 0px 5px" }}
        onChange={(e) => setRange(parseFloat(e.target.value))}
      />{" "}
      km
      <br />
      Center points:
      <div
        style={{
          display: "flex",
          maxWidth: "400px",
          flexWrap: "wrap",
        }}
      >
        {codes.map((c) => (
          <>
            <span
              key={c}
              style={{
                padding: "4px",
                border: "solid 1px rgba(255,255,255,0.3)",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
                maxWidth:
                  codes.length === 1 ? "95%" : codes.length < 3 ? "49%" : "23%",
              }}
              onClick={(e) => delCode(c)}
            >
              {tree._n(c)?.name}
            </span>
            &nbsp;
          </>
        ))}
      </div>
      <br />
      Match: {top10.length}
      <div>
        {top10.map((n, idx) => (
          <div key={`${n.code}_${n.distance}`}>
            {!codes.includes(`Q${n.code}`) ? (
              <button onClick={(e) => addCode(`Q${n.code}`)}>+</button>
            ) : (
              <div
                style={{
                  width: "25px",
                  height: "20px",
                  display: "inline-block",
                }}
              >
                &nbsp;
              </div>
            )}
            {n.name} -- {(n.distance * 10e-4).toFixed(2)} km - {n.data?.pop}
          </div>
        ))}
      </div>
      <hr />
    </div>
  ) : null;
};

//
//
//
const WikiDemography = () => {
  const { data: wikiCountries } = useWikiCountries(IS_CLOUD_ENABLED);
  //
  const tabs = ["Main Info", "Search", "Browse", "Nearby"];
  const [tabsIndex, setTabsIndex] = useState<number>(0);
  //
  const [countryCode, setCountryCode] = useState<string>("28"); // pre-load tree helper
  const [selectedCountry, setSelectedCountry] = useState<WikiCountry>();
  const [selectedCode, setSelectedCode] = useState<string>();
  //
  //
  const { loading, tree, keys, nodes } = useTreeHelper(countryCode);
  //

  const countries = useMemo(
    () =>
      wikiCountries
        ? wikiCountries.filter((c) => availableCountryCodes.includes(c.code))
        : [],
    [wikiCountries]
  );

  //
  const selectedCountryPanel = useMemo(() => {
    if (selectedCountry) {
      return (
        <>
          {selectedCountry.name}
          {/* {JSON.stringify(selectedCountry.urls.geo)}) */}
        </>
      );
    }
  }, [selectedCountry]);

  //
  //
  //
  const adminOneMemo = useMemo(() => {
    const arr =
      !loading && selectedCountry && keys.length && tree
        ? tree._children_of(tree._qq(selectedCountry.code))
        : [];
    //
    const beautifyName = (countryCode: number, s: string) => {
      switch (countryCode) {
        case 28:
          return s.replaceAll(" County", "").replaceAll(" District", "");
        case 36:
          return s.replaceAll(" Voivodeship", "").replaceAll(" province", "");
        case 668:
          return s.replaceAll(" Pradesh", "");
        default:
          return s;
      }
    };
    //
    return arr
      .map(([code, name, countryCode]) => ({
        code,
        name: beautifyName(countryCode, name),
        countryCode,
        size: tree?._children_of(tree._qq(code)).length ?? 0,
        data: tree?._n(code).data,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [loading, keys, tree, selectedCountry]);

  //
  //
  //
  const adminTwoMemo = useMemo(() => {
    const isReady = !loading && keys.length && tree && selectedCode;
    const selectedNode = isReady ? tree._n(selectedCode) : undefined;
    //
    // when [selectedNode] is [selectedCountryCode], returning empty list
    // when [selectedNode] is leaf, returning siblings instead of children
    //
    let arr;
    //
    if (isReady && selectedNode) {
      const isAdminOneLevel = selectedCode === "Q28";
      const isLeaf = tree?._is_leaf(selectedNode.code);
      //
      if (isAdminOneLevel) {
        //skip
        arr = [] as Array<Array<any>>;
      } else {
        if (isLeaf) {
          const parentCode = parseInt(selectedNode.p || "3");
          //
          arr =
            !loading && keys.length && tree && selectedCode
              ? tree._children_of(parentCode)
              : [];
        } else {
          arr =
            !loading && keys.length && tree && selectedCode
              ? tree._children_of(tree._qq(selectedCode))
              : [];
        }
      }
    } else arr = [] as Array<Array<any>>;
    //
    // resolving item-details (number of children, treeNode)
    //
    const expanded = arr.map(([code, name, parentCode]) => [
      code,
      name,
      parentCode,
      tree?._children_of(tree._qq(code || "")).length ?? 0,
      tree?._n(code).data,
    ]);
    //
    // sorting resultset by population descending
    //
    expanded.sort((a, b) => (b[4].pop || 0) - (a[4].pop || 0));
    //
    return expanded;
  }, [loading, keys, tree, selectedCode]);

  //
  const onCountryClicked = (c: WikiCountry) => {
    setCountryCode(c.code.replace("Q", ""));
    setSelectedCountry(c);
  };

  const backToParentMemo = useMemo(() => {
    if (!tree || !selectedCode) return null;
    //
    const isAminOneLevel = selectedCode === "Q28";
    //
    if (isAminOneLevel) return null;
    //
    // the button is visible, we need to know, [selectedNode]
    // is a leaf or not, to navigate correctly
    //
    const selectedNode = tree._n(selectedCode);
    const isLeaf = tree._is_leaf(selectedNode.code);
    //
    const selectedParent = tree._n(tree._qc(selectedNode.p));
    const selectedGrandParent = isLeaf
      ? tree._n(tree._qc(selectedParent.p))
      : undefined;
    //
    const activeParent = isLeaf ? selectedGrandParent : selectedParent;
    //
    return (
      <button
        onClick={() => {
          if (tree && selectedCode && activeParent) {
            setSelectedCode(tree._qc(activeParent.code));
          }
        }}
      >
        [..]
      </button>
    );
  }, [tree, selectedCode]);

  //
  //  loading >> selectedCountry >> selectedCode
  //
  return (
    <div>
      {/* COUNTRY SELECTION */}
      {!selectedCountry ? (
        <>
          <h3>Available Countries</h3>
          <p>Please select a country to start.</p>
          <CountryList countries={countries} onClicked={onCountryClicked} />
        </>
      ) : (
        <>
          <h3>{selectedCountry.name}</h3>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              textAlign: "center",
            }}
          >
            {tabs.map((t, idx) =>
              idx === tabsIndex ? (
                <div
                  key={idx}
                  style={{
                    border: "1px solid gold",
                    flexGrow: 1,
                    padding: "3px",
                  }}
                >
                  <b style={{ color: "gold" }}>{t}</b>
                </div>
              ) : (
                <div
                  key={idx}
                  style={{
                    border: "1px solid silver",
                    flexGrow: 1,
                    padding: "3px",
                  }}
                  onClick={() => setTabsIndex(idx)}
                >
                  {t}
                </div>
              )
            )}
          </div>
        </>
      )}

      {tabsIndex === 0 ? (
        <>
          {/* COUNTRY DETAILS */}
          {selectedCountry && (
            <>
              <h3>Country Details</h3>
              {selectedCountryPanel}
              {!selectedCode ? (
                <p>
                  Please{" "}
                  <span
                    style={{ color: "gold" }}
                    onClick={(e) => setTabsIndex(1)}
                  >
                    search
                  </span>{" "}
                  for a settlement to continue.
                </p>
              ) : null}
            </>
          )}
        </>
      ) : null}

      {tabsIndex === 1 ? (
        <>
          <h3>Search for a Settlement</h3>
          <SettlementSearch
            tree={tree}
            countryCode={countryCode}
            setSelectedCode={setSelectedCode}
          />
        </>
      ) : null}
      {tabsIndex === 2 ? (
        <>
          {/* ADMINISTRATIVE ZONES */}
          {selectedCountry && (
            <>
              <h3>Browse for a Settlement</h3>
              <div
                style={{
                  display: "flex",
                  maxHeight: "400px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    minWidth: "30%",
                    maxWidth: "50%",
                    flexGrow: 1,
                    maxHeight: "280px",
                    overflowX: "hidden",
                    border: "solid 1px blue",
                  }}
                >
                  A1
                  {nodes && selectedCountry ? (
                    <AdminOneList
                      items={adminOneMemo}
                      setSelectedCode={setSelectedCode}
                    />
                  ) : null}
                </div>
                <div
                  style={{
                    minWidth: "30%",
                    maxWidth: "50%",
                    flexGrow: 1,
                    maxHeight: "280px",
                    overflowX: "hidden",
                    border: "solid 1px blue",
                  }}
                >
                  A2 {backToParentMemo}
                  {selectedCode ? (
                    <AdminTwoList
                      items={adminTwoMemo}
                      setSelectedCode={setSelectedCode}
                    />
                  ) : null}
                </div>
              </div>
            </>
          )}
        </>
      ) : null}

      {tabsIndex === 3 ? (
        <>
          {/* NEARBY ITEMS */}
          {tree && selectedCountry && selectedCode ? (
            <div style={{ width: "100%" }}>
              <h3>
                Nearby {tree._n(selectedCode)?.name} ({selectedCode})
              </h3>

              <div
                style={{
                  display: "flex",
                  maxHeight: "250px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    minWidth: "300px",
                    maxWidth: "50%",
                    flexGrow: 1,
                    maxHeight: "280px",
                    overflowX: "hidden",
                    border: "solid 1px blue",
                  }}
                >
                  <NearbyTreeItem
                    tree={tree}
                    selectedCode={selectedCode}
                    setSelectedCode={setSelectedCode}
                  />
                </div>
                <div
                  style={{
                    minWidth: "300px",
                    maxWidth: "50%",
                    flexGrow: 1,
                    maxHeight: "280px",
                    overflowX: "hidden",
                    border: "solid 1px blue",
                  }}
                >
                  <NearbyToTreeItems tree={tree} selectedCode={selectedCode} />
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
        </>
      ) : null}

      {/* BREAD CRUMB NAVIGATION */}
      {loading || !tree ? (
        <Spinner />
      ) : loading ? (
        "Loading..."
      ) : (
        <div style={{ marginTop: "15px" }}>
          <TreeBreadCrumb
            tree={tree}
            selectedCode={selectedCode}
            setSelectedCode={setSelectedCode}
          />
          <DemographyGame3D
            tree={tree}
            selectedCountry={selectedCountry}
            selectedCode={selectedCode}
            isCameraEnabled={true}
            isFrameCounterEnabled={false}
            path=".."
            setSelectedCode={setSelectedCode}
          />
        </div>
      )}
      {/* SELECTION DETAILS */}
      <WikiItemDetails selectedCode={selectedCode} />
    </div>
  );
};

export default WikiDemography;
