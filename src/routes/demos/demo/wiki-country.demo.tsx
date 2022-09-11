import { useEffect, useMemo, useRef, useState } from "react";
import { NavigateFunction } from "react-router-dom";
import { isMobile } from "react-device-detect";
import { useFullscreen } from "rooks";

import {
  useWikiCountries,
  WikiCountry,
} from "../../../fiber-apps/wiki-country/hooks/useWikiCountries";

import WikiCountryApp3D from "../../../fiber-apps/wiki-country/wiki-country-app-3d";
import {
  BackgroundImage,
  CountryItemBody,
  CountryItemContainer,
  CountryListContainer,
  WikiCountryDemoWrapper,
} from "./wiki-country.styles";
import useWindowSize from "../../../hooks/useWindowSize";

const useWikiGeoJson = (geojsonUrl: string) => {
  const [selectedWikiCountryGeo, setSelectedWikiCountryGeo] = useState<any>();
  //
  // when [selectedWikiCountry] triggering load of
  // the country from wikidata in geojson format
  //
  useEffect(() => {
    if (geojsonUrl) {
      const origUrl = geojsonUrl;
      const resource = origUrl.split("/").pop();
      //
      const new_url = `https://commons.wikimedia.org/w/api.php?action=query&prop=revisions&rvslots=*&rvprop=content&format=json&titles=${resource}&origin=*`;
      //
      const txtFromResult = (r: any) => {
        if (r.query) {
          const page = Object.values(r.query.pages)[0];
          //
          if (page) {
            const revision = (page as any).revisions[0];
            //
            if (revision) {
              return revision.slots.main["*"];
            }
          }
        }
      };
      //
      if (new_url) {
        fetch(new_url)
          .then((r) => r.json())
          .then((json) => {
            const geojsonAsText = txtFromResult(json);
            //
            if (geojsonAsText) {
              setSelectedWikiCountryGeo(JSON.parse(geojsonAsText));
            }
          });
      }
    }
    //
    return () => setSelectedWikiCountryGeo(undefined); // reset on unmount
  }, [geojsonUrl]);
  //
  return { selectedWikiCountryGeo };
};

// const PAGE_SIZE = isMobile ? 4 : 8;

const WikiCountryDemo = (props: {
  navigate: NavigateFunction;
  path?: string | undefined;
}) => {
  const { navigate, path } = props;
  //
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  //
  const { isPortrait } = useWindowSize();
  //
  const PAGE_SIZE = useMemo(
    () => (!isMobile ? 8 : isPortrait ? 3 : 4),
    [isPortrait]
  );

  useEffect(() => {}, [isPortrait]);

  const { isFullscreenAvailable, isFullscreenEnabled, toggleFullscreen } =
    useFullscreen({ target: fullscreenContainerRef });
  //
  //
  const { data: wikiCountries } = useWikiCountries();
  const [pageIndex, setPageIndex] = useState<number>();

  const [countryIndex, setCountryIndex] = useState<number>();
  const [originCountry, setOriginCountry] = useState<WikiCountry>(); // selection for 'nearby listing'

  const [selectedWikiCountry, setSelectedWikiCountry] = useState<any>(); // selection for 3d app
  //
  const selectedWikiCountryUrl = useMemo(
    () => (selectedWikiCountry ? selectedWikiCountry.urls.geo : undefined),
    [selectedWikiCountry]
  );

  const { selectedWikiCountryGeo } = useWikiGeoJson(selectedWikiCountryUrl);

  //
  //
  //
  useEffect(() => {
    const ci = countryIndex ?? 0; // accept undefined
    //
    const origin = wikiCountries
      ? wikiCountries.find((c) => c.idx === ci)
      : undefined;
    //
    setOriginCountry(origin);
  }, [countryIndex, wikiCountries]);

  const distanceFrom = (c: WikiCountry, { x, y }: { x: number; y: number }) => {
    if (!c.coords) return 0;
    //
    const [lat1, lat2] = [c.coords[0], x];
    const [lon1, lon2] = [c.coords[1], y];

    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const side = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * side; // in metres
    //
    return d * 10e-4; //TODO: check why -4 instead of -3
  };
  //
  //
  //
  const nearbyCountries = useMemo(() => {
    if (!wikiCountries) return undefined;
    //
    if (originCountry) {
      const [ox, oy] = originCountry.coords ?? [0, 0];
      //
      const diffs = wikiCountries
        .map(
          (c) => [c, distanceFrom(c, { x: ox, y: oy })] as [WikiCountry, number]
        )
        .sort((a, b) => a[1] - b[1]);
      //
      const ds = diffs.map((d) => d[1]).slice(0, PAGE_SIZE);
      const countries = diffs.map((d) => d[0]).slice(0, PAGE_SIZE);
      const countriesWithDistance = countries.map((c, i) => ({
        ...c,
        distance: ds[i],
      }));
      //
      return countriesWithDistance;
    }
    //
    return undefined; // instead of empty list
  }, [wikiCountries, originCountry, PAGE_SIZE]);

  //
  // providing the next page from the resultset
  //
  const listMemo = useMemo(() => {
    if (wikiCountries) {
      if (nearbyCountries) return nearbyCountries;
      //
      const pi = pageIndex || 0;
      const [from, to] = [pi, pi + 1].map((i) => i * PAGE_SIZE);
      return wikiCountries.slice(from, to);
    }
  }, [wikiCountries, pageIndex, nearbyCountries, PAGE_SIZE]);
  //

  const onCountryClicked = (c: any, origIndex: number) => {
    setSelectedWikiCountry(c);
    setCountryIndex(origIndex);
  };

  //
  // Properties of selected country's capital
  //
  const capitalProps = useMemo(() => {
    if (selectedWikiCountry) {
      const { capital, capitalPopulation, coords } = selectedWikiCountry;
      const [lng, lat] = coords.map(parseFloat) as [number, number];
      //
      return {
        name: String(capital),
        population: parseInt(capitalPopulation),
        lat,
        lng,
      };
    }
    //
    return undefined;
  }, [selectedWikiCountry]);

  const applicationProps = useMemo(
    () =>
      selectedWikiCountryGeo && capitalProps
        ? {
            capital: capitalProps,
            geo: selectedWikiCountryGeo,
          }
        : undefined,
    [capitalProps, selectedWikiCountryGeo]
  );
  //
  return (
    <div ref={fullscreenContainerRef}>
      <button
        onClick={() => {
          if (nearbyCountries) {
            setOriginCountry(undefined);
          } else {
            setPageIndex((i) => (i ?? 0) + 1);
          }
        }}
      >
        {nearbyCountries
          ? "Back to alphabetical"
          : !pageIndex
          ? "Show Next page"
          : `Next page (${pageIndex})`}
      </button>
      {isFullscreenAvailable && (
        <button onClick={toggleFullscreen} style={{ float: "right" }}>
          {isFullscreenEnabled ? "Disable fullscreen" : "Enable fullscreen"}
        </button>
      )}
      <span style={{ marginLeft: "30%", width: "200px" }}>
        {originCountry && `Nearby ${originCountry.name}`}
      </span>
      {listMemo && (
        <CountryListContainer>
          {listMemo.map((c, idx) => (
            <CountryItemContainer
              key={c.idx}
              onClick={() => onCountryClicked(c, c.idx)}
            >
              <BackgroundImage imageUrl={c.urls.flag}>
                <small>
                  {c.distance ? `${c.distance.toFixed(1)} km away` : ""}
                </small>
                <b>{(c.population * 0.000001).toFixed(2)}M</b>
              </BackgroundImage>
              <CountryItemBody>
                <h2>{c.name}</h2>
                <span>{c.capital}</span>
              </CountryItemBody>
            </CountryItemContainer>
          ))}
        </CountryListContainer>
      )}

      <WikiCountryDemoWrapper>
        <WikiCountryApp3D
          navigate={navigate}
          path={path}
          applicationProps={applicationProps}
          isFullscreenEnabled={isFullscreenEnabled}
        />
      </WikiCountryDemoWrapper>
    </div>
  );
};

export default WikiCountryDemo;
