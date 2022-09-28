import {
  addCollectionAndDocuments,
  getFirestoreCollection,
} from "../firestore";

import type { WikiCountry } from "./wiki-country.types";

const COLLECTION_NAME = "wiki-countries";

//
// 'Point(1.5 42.5)' -> [1.5, 42.5]
//
const pointToCoordinate = (s: string) => {
  if (!s) return undefined;
  //
  const [lat, lng] = s
    .split(" ")
    .map((token) => token.replace("Point(", "").replace(")", ""))
    .map(parseFloat);

  return [lat, lng] as [number, number];
};

//
// transforming a source record to WikiCountry
//
export const transformCountry = (
  c: Record<string, any>,
  idx: number
): WikiCountry => ({
  idx,
  code: c.country.split("/").pop(),
  coords: pointToCoordinate(c.c_ll),
  minElevation: c.c_min_elevation ? parseInt(c.c_min_elevation) : 0,

  name: c.countryLabel ?? "NO DATA",
  capital: c.capitalLabel ?? "NO DATA",
  population: c.co_pop ? parseInt(c.co_pop) : 0,
  capitalPopulation: c.c_pop ? parseInt(c.c_pop) : 0,
  //
  //
  //
  urls: {
    geo: c.co_geoshape ?? "",
    flag: c.co_flag ?? "",
    flagArms: c.co_flag ?? "",
    //
    capital: c.capital ?? "",
    self: c.country,
  },
});

//
// Example method on how to migrate from local JSON data
// to a Firebase Collection
//
export const uploadWikiCountriesToFirestore = async () => {
  const DATA_SOURCE_WIKICOUNTRIES_URL = `data/wikidata/json/countries_with_flags_and_arms_elevation_and_pop.json`;
  //
  fetch(DATA_SOURCE_WIKICOUNTRIES_URL)
    .then((response) => response.json())
    .then((json) => {
      //
      // transform input and exclude countries without coordinates
      //
      const countriesWithCoordinates = json
        .map(transformCountry)
        .filter((d: any) => d.coords) as Array<WikiCountry>;
      //
      // sort on wikicode (optional)
      //
      const w = (s: string) => parseInt((s || "").replace("Q", "")) ?? 0;
      countriesWithCoordinates.sort(
        (a: { code: string }, b: { code: string }) => w(a.code) - w(b.code)
      );
      //
      // console.log("countriesWithCoordinates", countriesWithCoordinates);
      //
      // Batch insert array of countries, using [code] attribute as unique key
      //
      const objectsToAdd = countriesWithCoordinates;
      const keysToUse = countriesWithCoordinates.map((c) => c.code);
      //
      addCollectionAndDocuments<WikiCountry>(
        COLLECTION_NAME,
        objectsToAdd,
        keysToUse
      );
    });
};

export const getWikiCountriesFromStore = async (): Promise<
  Array<WikiCountry>
> => getFirestoreCollection<WikiCountry>(COLLECTION_NAME);
