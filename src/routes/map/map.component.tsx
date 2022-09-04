import { useEffect, useMemo, useState } from "react";

import styled from "styled-components";

import { Spinner } from "../../components/spinner/spinner.component";
import { useTreeHelper } from "../../hooks/useTreeHelper";
import { useWikidata } from "../../hooks/useWikidata";

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

const Map = () => {
  const [countries, setCountries] = useState<Array<any>>();

  //
  // loading geojson
  //
  useEffect(() => {
    const afterDataLoaded = (countries: any) => {
      setCountries(countries);
      //
      const fs = countries.features;
      const mapped = fs.map(
        (f: {
          properties: Record<string, any>;
          geometry: { coordinates: Array<[number, number]> };
        }) => ({
          id: f.properties.id,
          name: f.properties.name,
          path: f.geometry.coordinates,
        })
      );
      setCountries(mapped);
    };

    const fn = () => {
      // fetch("data/geojson/admin1.geojson")
      fetch("data/geojson/ne_110m_admin_0_countries.geojson")
        .then((res) => res.json())
        .then(afterDataLoaded);
    };
    console.log("loading geojson");
    fn();
  }, []);
  //

  //
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

  const [svgCanvasWidth, svgCanvasHeight] = [960, 400];
  const svgPathMemo = useMemo(() => {
    if (!countries) return { paths: [undefined] };

    const projectToCanvas = (latLng: { lat: number; lng: number }) => {
      //
      // projecting from [ lat:[-90, +90], lng: [-180, +180] ]
      //            to   [ x: [0, canvasWidth], y: [0, canvasHeight] ]
      //
      return {
        x: (latLng.lng + 180) * (svgCanvasWidth / 360),
        y:
          svgCanvasHeight / 2 -
          ((svgCanvasHeight *
            Math.log(
              Math.tan(Math.PI / 4 + (latLng.lat * Math.PI) / 180 / 2)
            )) /
            (2 * Math.PI)) *
            (svgCanvasWidth / svgCanvasHeight),
      };
    };

    //
    function convertCoordinatesToSvgPaths(
      coordArrays: Array<Array<[number, number]>>,
      fx: any
    ) {
      console.log("gmpath", coordArrays);
      //
      const svgPaths = [];
      //
      let minX = svgCanvasWidth;
      let minY = svgCanvasHeight;
      let maxX = 0;
      let maxY = 0;

      for (let pp = 0; pp < coordArrays.length; ++pp) {
        // console.log("feature", pp);
        const [coords /*, outterRingCoords*/] = coordArrays[pp];
        const svgPath = [];
        //
        for (let p = 0; p < coords.length; ++p) {
          const point = projectToCanvas(fx(coords[p]));
          //
          minX = Math.min(minX, point.x);
          minY = Math.min(minY, point.y);
          maxX = Math.max(maxX, point.x);
          maxY = Math.max(maxY, point.y);
          //
          svgPath.push([point.x, point.y].join(","));
        }
        //
        svgPaths.push(svgPath.join(" "));
      }

      return {
        //path: "M" + svgPaths.join("z M") + "z",   // single path
        paths: svgPaths.map((svgp) => `M${svgp}z`), // one path per feature
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      };
    }

    const svgProps = convertCoordinatesToSvgPaths(
      countries.map((c) => c.path),
      (coord: [number, number]) => ({ lat: coord[1], lng: coord[0] })
    );
    //
    //
    return svgProps;
  }, [countries, svgCanvasWidth, svgCanvasHeight]);
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
  //
  //
  //
  return (
    <div>
      Map ({countrySelected})
      <hr />
      {countries && (
        <>
          {svgPathMemo && (
            <Svg
              style={{ border: "solid 1px red" }}
              {...svgPathMemo}
              width={svgCanvasWidth}
              height={svgCanvasHeight}
            >
              {countries.map(({ id, name, path }, index) => {
                // console.log("drawing c path", id, name, path);
                return (
                  <Path
                    key={index}
                    color={"white"}
                    strokeWidth={0.5}
                    data-testid={name}
                    onMouseEnter={mouseEnter.bind(null, { name })}
                    onMouseLeave={mouseLeave}
                    d={svgPathMemo.paths[index]}
                  />
                );
              })}
            </Svg>
          )}
          {countrySelected && JSON.stringify(countrySelected)}
        </>
      )}
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
