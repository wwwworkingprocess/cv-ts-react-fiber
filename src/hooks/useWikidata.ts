import { useEffect, useState } from "react";

export const useWikidata = (qualifier: string) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Array<any> | null>(null);

  const fetchApi = (code: string) => {
    if (code) {
      const url = `https://www.wikidata.org/wiki/Special:EntityData/${code}.json`;
      //
      fetch(url)
        //fetch("https://jsonplaceholder.typicode.com/users")
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          setLoading(false);
          setData(json);
        })
        .catch((error) => {
          setData(null);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchApi(qualifier);
  }, [qualifier]);

  return { loading, data };
};
