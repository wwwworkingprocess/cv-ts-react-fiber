// import SignUpForm from "../../components/sign-up-form/sign-up-form.component";
// import SignInForm from "../../components/sign-in-form/sign-in-form.component";

import { useMemo, useState } from "react";
import styled from "styled-components";
import { Spinner } from "../../components/spinner/spinner.component";
import { useTreeHelper } from "../../hooks/useTreeHelper";
import { useWikidata } from "../../hooks/useWikidata";

const countries = [
  {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [3.087, -54.401],
          [3.407, -54.349],
          [3.566, -54.322],
          [3.571, -54.516],
          [3.407, -54.528],
          [3.224, -54.541],
          [3.087, -54.401],
        ],
      ],
    },
    properties: { id: "BVT", name: "Bouvet Island" },
  },
  {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [25.27, -17.799],
          [26.187, -19.502],
          [27.617, -20.572],
          [27.779, -21.123],
          [28.123, -21.527],
          [28.919, -21.788],
          [29.361, -22.197],
          [28.271, -22.66],
          [27.053, -23.648],
          [26.795, -24.278],
          [26.002, -24.719],
          [25.585, -25.583],
          [25.332, -25.742],
          [24.472, -25.766],
          [23.44, -25.306],
          [23.033, -25.325],
          [22.56, -26.193],
          [21.661, -26.83],
          [21.283, -26.866],
          [20.7, -26.818],
          [20.824, -26.071],
          [20.698, -25.63],
          [20.413, -25.096],
          [19.999, -24.752],
          [20.014, -22.094],
          [20.936, -21.971],
          [20.999, -21.602],
          [20.999, -21.407],
          [20.999, -20.851],
          [20.999, -20.567],
          [20.999, -20.142],
          [21, -18.32],
          [21.463, -18.304],
          [21.72, -18.256],
          [23.185, -18.01],
          [23.668, -18.422],
          [24.307, -18.019],
          [25.263, -17.791],
          [25.27, -17.799],
        ],
      ],
    },
    properties: { id: "BWA", name: "Botswana" },
  },
].map((f) => ({
  id: f.properties.id,
  name: f.properties.name,
  path: f.geometry.coordinates,
}));

type TSvg = {
  width: number;
  height: number;
};
export const Svg = styled.svg.attrs<TSvg>((props) => ({
  viewBox: `0 0 ` + props.width + ` ` + props.height,
  preserveAspectRatio: `xMidYMid meet`,
  width: props.width,
  height: props.height,
}))``;

export const Path = styled.path`
  cursor: pointer;
  fill: #fff;
  stroke: #ccc;
  :hover {
    fill: #ada;
  }
  :active {
    opacity: 0.8;
  }
`;

// import { AuthenticationContainer } from "./authentication.styles";

const Map = () => {
  const [countryCode, setCountryCode] = useState<string>("28");
  const [selectedCode, setSelectedCode] = useState<string>("Q28");
  //
  const { loading, tree, keys, nodes, path_hierarchy } =
    useTreeHelper(countryCode);
  //
  const { loading: wikiLoading, data } = useWikidata(selectedCode);
  //
  const loadHungary = (e: any) => setCountryCode("28");
  const loadPoland = (e: any) => setCountryCode("36");
  const loadIndia = (e: any) => setCountryCode("668");
  //
  //
  const adminOneMemo = useMemo(() => {
    return keys.length && tree ? tree._children_of(parseInt(countryCode)) : [];
  }, [keys, tree, countryCode]);
  //
  const adminTwoMemo = useMemo(() => {
    return keys.length && tree ? tree._children_of(tree._qq(selectedCode)) : [];
  }, [keys, tree, selectedCode]);

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

  const [keyword, setKeyword] = useState<string>("");
  //
  const searchResultsMemo = useMemo(() => {
    const nodes = tree && keyword && keyword.length > 1 ? tree.list_all() : [];
    // const labels = nodes.map((n) => n.name);
    //
    const matchingNames = nodes.filter(
      (node) => node.name.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
    );

    //
    console.log("searchResultsMemo", nodes.length, nodes[10]);
    console.log("matchingNames", matchingNames);

    //
    // sort by name before returning result
    //
    matchingNames.sort((a, b) => a.name.localeCompare(b.name));

    return matchingNames;
  }, [tree, keyword]);

  //
  //
  //
  const renderAsList = (a1s: Array<any>) => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        {a1s.map((a1) => (
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
            key={a1[0]}
            onClick={() => {
              console.log("selecting", a1[0], a1[1], a1[2]);
              console.log("node", tree?._search(a1[1]));
              console.log("node", a1[0], tree?._find(tree?._qq(a1[0])));

              setSelectedCode(a1[0]);
            }}
          >
            {a1[1]}
          </span>
        ))}
      </div>
    );
  };

  const [countrySelected, setCountrySelected] = useState<string | null>();
  //
  function mouseEnter(country: any) {
    setCountrySelected(country.name);
  }

  function mouseLeave() {
    setCountrySelected(null);
  }
  //
  const [width, height] = [300, 200];
  //
  //
  //
  return (
    <div>
      Map
      <hr />
      <>
        <Svg width={width} height={height}>
          {countries.map(({ id, name, path }, index) => {
            console.log(path);
            return (
              <Path
                key={index}
                data-testid={name}
                onMouseEnter={mouseEnter.bind(null, { name })}
                onMouseLeave={mouseLeave}
                // onClick={() => onCountryClick!({ id, name })}
              />
            );
          })}
        </Svg>
        {/* {countrySelected && <CountryDetails name={countrySelected} />} */}
      </>
      <hr />
      Keyword:{" "}
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />{" "}
      {keyword}
      <hr />
      searchResults:{" "}
      {searchResultsMemo ? searchResultsMemo.length : "no results"}
      <hr />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
        }}
      >
        {searchResultsMemo
          ? searchResultsMemo.map((sr) => (
              <div>
                {sr.name} ({sr.data ? sr.data.pop : "-"})
              </div>
            ))
          : "no results"}
      </div>
      <hr />
      Country code: {countryCode}
      <button onClick={loadHungary}>Change (HUN)</button>
      <button onClick={loadPoland}>Change (POL)</button>
      <button onClick={loadIndia}>Change (IND)</button>
      <hr />
      {path_hierarchy}
      <hr />
      {String(loading)};
      {loading || !tree ? (
        <Spinner />
      ) : (
        <>
          {tree ? Object.keys(tree.NODES).length : "loading"}
          <hr />
          {keys[0]}
          <hr />
          {nodes ? JSON.stringify(nodes[keys[0]]) : "loading"}
          <hr />
          MEMO:
          {nodes ? renderAsList(adminOneMemo) : "loading"}
          <hr />
          {/* INLINE:
          {nodes
            ? JSON.stringify(tree._children_of(parseInt(countryCode)))
            : "loading"} */}
          Selected code: {selectedCode}
          A2 MEMO:
          {selectedCode ? renderAsList(adminTwoMemo) : "loading"}
          <hr />
          WIKI: {String(wikiLoading)}
          {wikiLoading || !data ? (
            <Spinner />
          ) : (
            <>
              WIKI LOADED
              <div>
                {wikiEntry ? Object.keys(wikiEntry).join(" -- ") : "loading"}
              </div>
            </>
          )}
          <hr />
          CLAIMS:
          {wikiLoading || !data ? (
            <Spinner />
          ) : (
            <>
              WIKI LOADED
              <div>
                {wikiEntry
                  ? Object.keys(wikiEntry.claims).join(" -- ")
                  : "loading"}
              </div>
              <div>
                {wikiEntry
                  ? JSON.stringify(wikiEntry.claims["P41"])
                  : "loading"}
              </div>
              <div>
                imageURL:
                {wikiEntry && wikiImageUrl ? wikiImageUrl : "no img"}
              </div>
              <div>
                {wikiImageUrl ? <img src={wikiImageUrl} alt="" /> : "no img"}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Map;
