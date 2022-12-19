import { useEffect, useMemo, useState } from "react";
import { WikiCountry } from "../../utils/firebase/repo/wiki-country.types";

type ResultRawEntry = {
  type: string;
  value: string;
};

const queryActiveCountries = `SELECT 
DISTINCT ?country ?capital ?countryLabel ?capitalLabel ?population (MIN(?c_pop) AS ?c_min_pop) (MIN(?c_elevation) AS ?c_min_elevation) (MIN(?c_area) AS ?c_min_area) (MIN(?c_ll) AS ?c_min_ll) ?c_geoshape ?c_flag
{
  ?country wdt:P31 wd:Q6256 ; 
  OPTIONAL {?country wdt:P01082 ?population } .
  OPTIONAL {?country wdt:P3896 ?c_geoshape} .
  OPTIONAL {?country wdt:P41 ?c_flag} .
  FILTER NOT EXISTS {?country wdt:P31 wd:Q3024240}
  FILTER NOT EXISTS {?country wdt:P31 wd:Q28171280}
  OPTIONAL { 
    ?country wdt:P36 ?capital ; wdt:P36 / wdt:P625 ?c_ll 
    OPTIONAL {?capital wdt:P01082 ?c_pop} .
    OPTIONAL {?capital wdt:P02044 ?c_elevation} .
    OPTIONAL {?capital wdt:P02046 ?c_area} .
  } .

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
}
GROUP BY ?country ?capital ?countryLabel ?capitalLabel ?population ?c_min_pop ?c_min_area  ?c_min_ll  ?c_geoshape ?c_flag
ORDER BY ?countryLabel DESC(?population)`;

const DATA_FIELDS = [
  "c_flag",
  "c_geoshape",
  "c_min_area",
  "c_min_elevation",
  "c_min_ll",
  "c_min_pop",
  "capital",
  "capitalLabel",
  "country",
  "countryLabel",
  "population",
];

const processCountryQueryResult = (r: {
  head: { vars: Array<any> };
  results: {
    bindings: Array<Record<string, ResultRawEntry>>;
  };
}) => {
  //
  const bindings = r.results?.bindings || [];
  //
  const codeFromUrl = (url: string) =>
    url.replace("http://www.wikidata.org/entity/", "");

  const hasAllFields = (b: Record<string, ResultRawEntry>) =>
    DATA_FIELDS.map((f) => b[f] !== undefined).reduce((a, b) => a && b, true);

  const valids = bindings.filter(hasAllFields);
  const toInteger = (s: string) => parseInt(s ?? 0);
  const pointToCoordinate = (s: string) => {
    if (!s) return undefined;
    //
    const [lat, lng] = s
      .split(" ")
      .map((token) => token.replace("Point(", "").replace(")", ""))
      .map(parseFloat);

    return [lat, lng] as [number, number];
  };

  const entries = valids.map((b, idx) => {
    const country = b["country"].value;
    const capital = b["capital"].value;
    const flag = b["c_flag"].value; // thumbnailUrlFromImageUrl(b["c_flag"].value);
    const geo = b["c_geoshape"].value;
    //
    const code = codeFromUrl(country);
    const name = b["countryLabel"].value;
    const capitalName = b["capitalLabel"].value;
    const minElevation = toInteger(b["c_min_elevation"].value);
    const population = toInteger(b["population"].value);
    //
    const coords = pointToCoordinate(b["c_min_ll"].value);
    //
    return {
      idx,
      code,
      coords,
      minElevation,
      distance: undefined,
      name,
      capital: capitalName,
      population,
      capitalPopulation: 0,
      urls: {
        geo,
        flag,
        flagArms: "",
        capital,
        self: country,
      },
    } as WikiCountry;
  });
  //
  return entries;
};

//
// Retrieving list of 'active' countries from WikiData and formatting the result,
// expecting 204 elements in the received resultset and 171 after removing 'countries with missing values'
//
const useWikiCountryQuery = (): {
  loading: boolean;
  countries: Array<WikiCountry>;
} => {
  const [loading, setLoading] = useState<boolean>(false);
  const [countries, setCountries] = useState<Array<WikiCountry>>([]);
  //
  const query = queryActiveCountries;
  //
  useEffect(() => {
    if (!query) return;
    //
    const abortController = new AbortController();
    //
    // 1. create query
    // 2. execute query
    // 3. format results
    //
    setLoading(true);
    //
    const escapeQuery = (q: string): string =>
      q.replaceAll(" ", "%20").replaceAll("\n", "%20");
    const escapedQuery = escapeQuery(query);
    const url = `https://query.wikidata.org/sparql?format=json&query=${escapedQuery}`;
    //
    fetch(url, { method: "GET", signal: abortController.signal })
      .then((res) => res.json())
      .then(processCountryQueryResult)
      .then((countries) => {
        if (!abortController.signal.aborted) {
          setCountries(countries);
        }
      })
      .finally(() => setLoading(false));
    //
    return () => {
      abortController.abort();
    };
  }, [query]);
  //
  return useMemo(
    () =>
      loading || query.length === 0
        ? { loading: true, countries: [] }
        : { loading, countries },
    [query, loading, countries]
  );
};

export default useWikiCountryQuery;
