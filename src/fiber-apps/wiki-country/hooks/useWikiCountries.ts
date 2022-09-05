import { useEffect, useState } from "react";

const DATA_SOURCE_WIKICOUNTRIES_URL = `data/wikidata/json/countries_with_flags_and_arms_elevation_and_pop.json`;

export type WikiCountry = {
  idx: number;
  //
  coords?: [number, number];
  minElevation: number;
  //
  name: string;
  capital: string;
  population: number;
  capitalPopulation: number;
  //
  urls: {
    geo: string;
    flag: string;
    flagArms: string;
    //
    capital: string;
    self: string;
  };
};

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
const transformCountry = (
  c: Record<string, any>,
  idx: number
): WikiCountry => ({
  idx,
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

export const useWikiCountries = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Array<WikiCountry> | null>(null);

  //
  const fetchApi = (url: string) => {
    //
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        setLoading(false);
        //
        const countriesWithCoordinates = json
          .map(transformCountry)
          .filter((d: any) => d.coords);
        setData(countriesWithCoordinates);
      })
      .catch((error) => {
        setData(null);
        setLoading(false);
      });
  };

  //
  useEffect(() => {
    setLoading(true);
    fetchApi(DATA_SOURCE_WIKICOUNTRIES_URL);
  }, []);

  return { loading, data };
};
