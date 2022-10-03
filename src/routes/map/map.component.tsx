import { useEffect, useMemo, useState } from "react";
import { isMobile } from "react-device-detect";

import styled from "styled-components";
import CountryList from "../../components/demography/country-list/country-list.component";
import SettlementSearch from "../../components/demography/settlement-search/settlement-search.component";
import SvgWorldMap from "../../components/demography/svg-world-map/svg-world-map.component";

import { Spinner } from "../../components/spinner/spinner.component";
import { useWikiCountries } from "../../fiber-apps/wiki-country/hooks/useWikiCountries";
import useFirestoreDocument from "../../hooks/firestore/useFirestoreDocument";
import { useTreeHelper } from "../../hooks/useTreeHelper";

import { useWikidata } from "../../hooks/useWikidata";
import { IS_CLOUD_ENABLED } from "../../utils/firebase/provider";

const WikiDemography = () => {
  const [svgCountries, setSvgCountries] = useState<Array<any>>();
  //
  const { data: wikiCountries } = useWikiCountries(IS_CLOUD_ENABLED);
  const [selectedWikiCountry, setSelectedWikiCountry] = useState<any>();
  //
  // const firestoreDocumentUrl = `data/hgt/N42E011.hgt.zip`;
  // const { data: firestoreHgt } = useFirestoreDocument(firestoreDocumentUrl);
  //

  //
  // loading geojson
  //
  useEffect(() => {
    const afterDataLoaded = (countries: any) => {
      setSvgCountries(countries);
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
      setSvgCountries(mapped);
    };

    const fetchGeoJsonAllCountries = () => {
      fetch("data/geojson/ne_110m_admin_0_countries.geojson")
        .then((res) => res.json())
        .then(afterDataLoaded);
    };
    //
    fetchGeoJsonAllCountries();
  }, []);
  //

  //
  const [countryCode, setCountryCode] = useState<string>("28");
  const [selectedCode, setSelectedCode] = useState<string>("Q28");
  //
  const { loading, tree, keys, nodes } = useTreeHelper(countryCode);
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
            onClick={() => setSelectedCode(a1[0])}
          >
            {a1[1]}
          </span>
        ))}
      </div>
    );
  };

  const [countrySelected, setCountrySelected] = useState<string>();
  //
  const mouseEnter = (country: any) => setCountrySelected(country.name);
  const mouseLeave = () => setCountrySelected(undefined);
  const onCountryClicked = (c: any) => setSelectedWikiCountry(c);
  //
  //
  const selectedCountryPanel = useMemo(() => {
    if (selectedWikiCountry) {
      return (
        <>
          {selectedWikiCountry.name}
          <br />
          {JSON.stringify(selectedWikiCountry.urls.geo)})
        </>
      );
    }
  }, [selectedWikiCountry]);
  //
  return (
    <div>
      Map ({countrySelected})
      <hr />
      <hr />
      Country code: {countryCode}{" "}
      <button onClick={loadHungary}>Change (HUN)</button>
      <button onClick={loadPoland}>Change (POL)</button>
      <button onClick={loadIndia}>Change (IND)</button>
      <hr />
      <CountryList
        wikiCountries={wikiCountries}
        onCountryClicked={onCountryClicked}
      />
      <hr />
      {selectedCountryPanel}
      <hr />
      <SettlementSearch tree={tree} />
      <hr />
      {loading || !tree ? (
        <Spinner />
      ) : (
        <>
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
            <div>
              {wikiEntry ? Object.keys(wikiEntry).join(" -- ") : "loading"}
            </div>
          )}
          <hr />
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
                {wikiImageUrl ? <img src={wikiImageUrl} alt="" /> : "no img"}
              </div>
            </div>
          )}
          <hr />
          {/* Bounds: {boundsCheck ? JSON.stringify(boundsCheck) : "Loading hgt..."} */}
          <SvgWorldMap
            svgCountries={svgCountries}
            countrySelected={countrySelected}
            mouseEnter={mouseEnter}
            mouseLeave={mouseLeave}
          />
          <hr />
        </>
      )}
    </div>
  );
};

export default WikiDemography;
