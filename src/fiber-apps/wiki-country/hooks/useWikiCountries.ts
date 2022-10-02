import { useCallback, useEffect, useState } from "react";
import {
  getWikiCountriesFromStore,
  transformCountry,
} from "../../../utils/firebase/repo/wiki-country";
import type {
  WikiCountry,
  WikiCountryInputFlat,
} from "../../../utils/firebase/repo/wiki-country.types";

const WIKI_COUNTRIES_LOCAL_URL = `data/wikidata/json/countries_with_flags_and_arms_elevation_and_pop.json`;

export const useWikiCountries = (
  useStore: boolean,
  path?: string | undefined
) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Array<WikiCountry> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  //
  const onStart = () => {
    setData(null);
    setError(null);
    setLoading(true);
  };
  //
  const onError = (error: Error) => {
    setError(error);
    setLoading(false);
  };
  //
  const onSuccess = (data: Array<WikiCountry>) => {
    setData(data);
    setLoading(false);
  };
  //
  const onTransform = (json: Array<WikiCountryInputFlat>) =>
    json
      .map(transformCountry)
      .filter((d: any) => d.coords) as Array<WikiCountry>;

  //
  // Accessing local JSON, stored in public_dir/data
  //
  const fetchFromLocal = useCallback(
    (url: string) =>
      fetch(url)
        .then((response) => response.json())
        .then(onTransform)
        .then(onSuccess)
        .catch(onError),
    []
  );

  //
  // Accessing remote data from Firestore
  //
  const fetchFromFirestore = useCallback(
    () => getWikiCountriesFromStore().then(onSuccess).catch(onError),
    []
  );

  //
  // Initiate data retrieval
  //
  useEffect(() => {
    onStart();
    //
    const p = path ? `${path}` : "";
    const url = `${p}${WIKI_COUNTRIES_LOCAL_URL}`;
    //
    useStore ? fetchFromFirestore() : fetchFromLocal(url);
  }, [useStore, path, fetchFromFirestore, fetchFromLocal]);

  return { loading, data, error };
};
