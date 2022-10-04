import { useMemo, useState } from "react";

import CountryList from "../../components/demography/country-list/country-list.component";
import SettlementSearch from "../../components/demography/settlement-search/settlement-search.component";
// import SvgWorldMap from "../../components/demography/svg-world-map/svg-world-map.component";

import { Spinner } from "../../components/spinner/spinner.component";
import { useWikiCountries } from "../../fiber-apps/wiki-country/hooks/useWikiCountries";
import { useTreeHelper } from "../../hooks/useTreeHelper";

import { useWikidata } from "../../hooks/useWikidata";

import { IS_CLOUD_ENABLED } from "../../utils/firebase/provider";
import { WikiCountry } from "../../utils/firebase/repo/wiki-country.types";
import type TreeHelper from "../../utils/tree-helper";

const availableCountryCodes = ["Q28", "Q36", "Q668"];

const TreeBreadCrumb = (props: {
  selectedCode: string | undefined;
  tree: TreeHelper;
  //
  setSelectedCode: React.Dispatch<React.SetStateAction<string | undefined>>;
}) => {
  const { selectedCode, setSelectedCode, tree } = props;
  //
  if (!tree) return null;
  //
  const node = selectedCode ? tree._n(selectedCode) : undefined;
  const pcodes = node ? tree.get_pcodes(node) : [];
  //
  const parents = pcodes.map((code, idx) => ({
    code: pcodes[idx] ?? "",
    name: tree._find(code)?.name ?? "",
  }));
  //
  const RegionHeader = (props: {
    parents: Array<{ code: number; name: string }>;
  }) => {
    if (!parents || parents.length < 3) return null;
    //
    const [earth, continent, subContinent] = parents;
    //
    return (
      <h3 style={{ marginBottom: "5px", marginTop: "5px" }}>
        {earth.name}, {continent.name}, {subContinent.name}
      </h3>
    );
  };

  //
  return (
    <>
      <RegionHeader parents={parents} />
      {parents
        ? parents.map((p, level, arr) => (
            <>
              {/* Rendering item */}
              {level > 2 ? (
                <span>
                  <button
                    onClick={() => p.code && setSelectedCode(`Q${p.code}`)}
                  >
                    {p.name}
                  </button>
                </span>
              ) : null}
              {/* Rendering separator */}
              {level > 2 && level < arr.length - 1 && <span> &gt;&gt; </span>}
            </>
          ))
        : null}
    </>
  );
};

//
//
//
const WikiDemography = () => {
  const { data: wikiCountries } = useWikiCountries(IS_CLOUD_ENABLED);
  //
  console.log(
    wikiCountries
      ? wikiCountries
          .map((w) => w.code)
          .sort()
          .join("-")
      : ""
  );
  //
  const [countryCode, setCountryCode] = useState<string>("28");
  const [selectedCountry, setSelectedCountry] = useState<WikiCountry>();
  const [selectedCode, setSelectedCode] = useState<string>(); // "Q28");
  // const [countrySelected, setCountrySelected] = useState<string>();
  //
  //
  const { loading, tree, keys, nodes } = useTreeHelper(countryCode);
  //
  const { loading: wikiLoading, data } = useWikidata(selectedCode);
  //
  const loadHungary = (e: any) => {
    setCountryCode("28");
    setSelectedCountry(wikiCountries?.filter((c) => c.code === "Q28")[0]);
  };
  const loadPoland = (e: any) => {
    setCountryCode("36");
    setSelectedCountry(wikiCountries?.filter((c) => c.code === "Q36")[0]);
  };
  const loadIndia = (e: any) => {
    setCountryCode("668");
    setSelectedCountry(wikiCountries?.filter((c) => c.code === "Q668")[0]);
  };
  //

  const availableCountries = useMemo(
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

  //
  //
  //
  const wikiEntry = useMemo(
    () => (selectedCode ? (data as any)?.entities[selectedCode] : undefined),
    [data, selectedCode]
  );

  const wikiImageUrl = useMemo(() => {
    if (wikiEntry) {
      const { claims } = wikiEntry;
      const firstImageClaim = claims["P41"]?.[0];
      const firstImageName = firstImageClaim?.mainsnak?.datavalue?.value;
      //
      const url = firstImageName
        ? `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${firstImageName}&width=300`
        : undefined;
      //
      return url;
    }
    //
    return undefined;
  }, [wikiEntry]);

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
      Country code: {countryCode}{" "}
      <button onClick={loadHungary}>Change (HUN)</button>
      <button onClick={loadPoland}>Change (POL)</button>
      <button onClick={loadIndia}>Change (IND)</button>
      <hr />
      <CountryList
        wikiCountries={availableCountries}
        onCountryClicked={onCountryClicked}
      />
      <hr />
      <h3>Country Details</h3>
      {selectedCountryPanel}
      <hr />
      {selectedCountry && (
        <>
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
      ) : (
        <>
          A1: [{new Array(adminOneMemo.length).fill(".").join("")}]
          {nodes && selectedCountry
            ? renderAdminOneList(adminOneMemo)
            : "loading"}
          <hr />
          Selected code: {selectedCode}
          <hr />
          <TreeBreadCrumb
            tree={tree}
            selectedCode={selectedCode}
            setSelectedCode={setSelectedCode}
          />
          <hr />
          A2: [{new Array(adminTwoMemo.length).fill(".").join("")}]
          {selectedCode ? renderAdminTwoList(adminTwoMemo) : "loading"}
          <hr />
          {selectedCode && (
            <>
              {wikiLoading && <div>Loading...</div>}
              {wikiLoading || !data ? (
                <Spinner />
              ) : (
                <div>
                  {/* {wikiEntry ? Object.keys(wikiEntry).join(" -- ") : "loading"} */}
                  {wikiEntry ? <h3>{wikiEntry.labels["en"]?.value}</h3> : ""}
                </div>
              )}
              CLAIMS:
              {wikiLoading || !data ? (
                <Spinner />
              ) : (
                <div>
                  <div>
                    {wikiEntry
                      ? `${Object.keys(wikiEntry.claims).length} claims`
                      : "loading"}
                  </div>
                  <div>
                    imageURL:
                    {wikiEntry && wikiImageUrl ? wikiImageUrl : "no img"}
                  </div>
                  <div>
                    {wikiImageUrl ? (
                      <img src={wikiImageUrl} alt="" />
                    ) : (
                      "no img"
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          {/* Bounds: {boundsCheck ? JSON.stringify(boundsCheck) : "Loading hgt..."} */}
          {/* <SvgWorldMap
            selectedCountry={selectedCountry}
            mouseEnter={mouseEnter}
            mouseLeave={mouseLeave}
          /> */}
        </>
      )}
    </div>
  );
};

export default WikiDemography;
