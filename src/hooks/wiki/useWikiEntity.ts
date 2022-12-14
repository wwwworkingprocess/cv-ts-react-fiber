import { useCallback, useEffect, useState } from "react";

//
// Retrieves metadata from WikiData about the
// entity specified by the qualifier. (e.g Q1003 or Q1186)
//
export const useWikiEntity = (qualifier: string | undefined) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Array<any> | null>(null);
  //
  const onSuccess = (json: Array<any> | null) => {
    setLoading(false);
    setData(json);
  };
  //
  const onError = (error: Error) => {
    setData(null);
    setLoading(false);
  };
  //
  const fetchApi = useCallback((code: string | undefined) => {
    const validCode = code && code !== "Q-1";
    //
    if (validCode) {
      setLoading(true);
      //
      const url = `https://www.wikidata.org/wiki/Special:EntityData/${code}.json`;
      //
      fetch(url)
        .then((response) => response.json())
        .then(onSuccess)
        .catch(onError);
    }
  }, []);
  //
  useEffect(() => {
    //
    fetchApi(qualifier);
  }, [fetchApi, qualifier]);
  //
  return { loading, data };
};
