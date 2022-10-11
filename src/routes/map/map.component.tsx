import { Fragment, useMemo, useState } from "react";

import CountryList from "../../components/demography/country-list/country-list.component";
import SettlementSearch from "../../components/demography/settlement-search/settlement-search.component";
import TreeBreadCrumb from "../../components/demography/tree-bread-crumb/tree-bread-crumb.component";
import WikiItemDetails from "../../components/demography/wiki-item-details/wiki-item-details.component";
// import SvgWorldMap from "../../components/demography/svg-world-map/svg-world-map.component";

import { Spinner } from "../../components/spinner/spinner.component";
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
      Nearby Tree Item, Center {selectedCode}, range
      <input
        type="number"
        value={range}
        style={{ width: "50px" }}
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
  return tree ? (
    <div>
      Nearby To Tree Items , showing distance from {selectedCode}
      <br />
      Center points:{" "}
      {codes.map((c) => (
        <span
          key={c}
          style={{
            padding: "4px",
            border: "solid 1px rgba(255,255,255,0.3)",
          }}
          onClick={(e) => delCode(c)}
        >
          {c}
        </span>
      ))}
      <input
        type="number"
        value={range}
        step={0.1}
        style={{ width: "50px" }}
        onChange={(e) => setRange(parseFloat(e.target.value))}
      />{" "}
      km
      <br />
      Match: {top10.length}
      <div>
        {top10.map((n, idx) => (
          <div key={`${n.code}_${n.distance}`}>
            <button onClick={(e) => addCode(`Q${n.code}`)}>+</button>
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
  const [countryCode, setCountryCode] = useState<string>("28"); // pre-load tree helper
  const [selectedCountry, setSelectedCountry] = useState<WikiCountry>();
  const [selectedCode, setSelectedCode] = useState<string>();
  //
  //
  const { loading, tree, keys, nodes } = useTreeHelper(countryCode);
  // const { loading: wikiLoading, data } = useWikidata(selectedCode);
  //

  const countries = useMemo(
    () =>
      wikiCountries
        ? wikiCountries.filter((c) => availableCountryCodes.includes(c.code))
        : [],
    [wikiCountries]
  );
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
    return arr.map(([code, name, countryCode]) => ({
      code,
      name: beautifyName(countryCode, name),
      countryCode,
      size: tree?._children_of(tree._qq(code)).length ?? 0,
      data: tree?._n(code).data,
    }));
  }, [loading, keys, tree, selectedCountry]);
  //
  const adminTwoMemo = useMemo(() => {
    const arr =
      !loading && keys.length && tree && selectedCode
        ? tree._children_of(tree._qq(selectedCode))
        : [];
    //

    //
    const expanded = arr.map(([code, name, countryCode]) => [
      code,
      name,
      countryCode,
      tree?._children_of(tree._qq(code || "")).length ?? 0,
      tree?._n(code).data,
    ]);

    expanded.sort((a, b) => (b[4].pop || 0) - (a[4].pop || 0));
    //
    return expanded;
  }, [loading, keys, tree, selectedCode]);

  const formatPopulation = (p: number) => {
    if (p === -1) return "";
    if (p < 1000) return `${p}🧍`;
    if (p < 1000000) return `${(p * 0.001).toFixed(1)}k 🧍`;
    else return `${(p * 0.000001).toFixed(1)}M 🧍`;
  };
  //
  //
  //
  const renderAdminOneList = (
    a1s: Array<{
      code: string;
      name: string;
      countryCode: number;
      size: number;
      data: Record<string, any>;
    }>
  ) => {
    console.log("renderAdminOneList", a1s.length);
    console.log("renderAdminOneList", a1s[0]);
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        {a1s.map(({ code, name, countryCode, size, data }) => {
          //

          return (
            <span
              style={{
                flex: "1 1 0px",
                flexGrow: "1",
                textAlign: "center",
                border: "1px solid black",
                minWidth: "200px",
                maxWidth: "400px",
                padding: "5px",
                margin: "2px",
              }}
              key={code}
              onClick={() => setSelectedCode(code)}
            >
              {name}
              <br />
              <small>
                {size} 🏠 {formatPopulation(data.pop)}
              </small>
            </span>
          );
        })}
      </div>
    );
  };

  //
  //
  //
  const renderAdminTwoList = (a2s: Array<any>) => {
    const sumPop = a2s
      .map((a2) => a2[4].pop ?? -1)
      .filter((pop) => pop > 1)
      .reduce((a, b) => a + b, 0);
    //
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        {a2s.map((a2) => (
          <span
            style={{
              flex: "1 1 0px",
              flexGrow: "1",
              textAlign: "center",
              border: "1px solid black",
              minWidth: "200px",
              maxWidth: "400px",
              padding: "5px",
              margin: "2px",
            }}
            key={a2[0]}
            onClick={() => setSelectedCode(a2[0])}
          >
            {a2[1]} {a2[3] > 0 ? `(${a2[3]})` : ""} (
            {formatPopulation(a2[4]?.pop)})
          </span>
        ))}
        SUM: {sumPop}
      </div>
    );
  };
  //

  //
  // const mouseEnter = (country: any) => setCountrySelected(country.name);
  // const mouseLeave = () => setCountrySelected(undefined);
  const onCountryClicked = (c: WikiCountry) => {
    setCountryCode(c.code.replace("Q", ""));
    setSelectedCountry(c);
  };
  //
  //
  const selectedCountryPanel = useMemo(() => {
    if (selectedCountry) {
      return (
        <>
          {selectedCountry.name}
          <br />
          {JSON.stringify(selectedCountry.urls.geo)})
        </>
      );
    }
  }, [selectedCountry]);
  //
  return (
    <div>
      Map ({selectedCountry ? selectedCountry.name : ""})
      <hr />
      <h3>Available Countries</h3>
      Country code: {countryCode} <p>Please select a country to start.</p>
      <hr />
      <CountryList countries={countries} onClicked={onCountryClicked} />
      {selectedCountry && (
        <>
          <hr />
          <h3>Country Details</h3>
          {selectedCountryPanel}
          <hr />
          <h3>Search for a Settlement</h3>
          <SettlementSearch
            tree={tree}
            countryCode={countryCode}
            setSelectedCode={setSelectedCode}
          />
          <hr />
        </>
      )}
      {loading || !tree ? (
        <Spinner />
      ) : !loading ? (
        <>
          A1: [{new Array(adminOneMemo.length).fill(".").join("")}]
          {nodes && selectedCountry
            ? renderAdminOneList(adminOneMemo)
            : "loading"}
          {selectedCode ? (
            <>
              <hr />
              Selected code: {selectedCode}
              <hr />
            </>
          ) : null}
          <TreeBreadCrumb
            tree={tree}
            selectedCode={selectedCode}
            setSelectedCode={setSelectedCode}
          />
          {/* Bounds: {boundsCheck ? JSON.stringify(boundsCheck) : "Loading hgt..."} */}
          {/* <SvgWorldMap
            selectedCountry={selectedCountry}
            mouseEnter={mouseEnter}
            mouseLeave={mouseLeave}
          /> */}
        </>
      ) : (
        "Loading..."
      )}
      <hr />
      {tree && selectedCode ? (
        <div>
          Nearby {selectedCode}
          <NearbyToTreeItems tree={tree} selectedCode={selectedCode} />
          <NearbyTreeItem
            tree={tree}
            selectedCode={selectedCode}
            setSelectedCode={setSelectedCode}
          />
        </div>
      ) : (
        ""
      )}
      {selectedCode ? (
        <>
          <hr />
          A2: [{new Array(adminTwoMemo.length).fill(".").join("")}]
          {selectedCode ? renderAdminTwoList(adminTwoMemo) : "loading"}
          <hr />
        </>
      ) : null}
      <WikiItemDetails selectedCode={selectedCode} />
    </div>
  );
};

export default WikiDemography;
