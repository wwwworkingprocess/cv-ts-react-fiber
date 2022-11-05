import { useEffect, useMemo, useState } from "react";

const MAX_ID_PER_CALL = 50;
const WIKI_LABEL_QUERY_URL =
  "https://www.wikidata.org/w/api.php?action=wbgetentities&props=labels&languages=en&format=json&origin=*";

const urlFromIds = (ids: Array<string>) =>
  `${WIKI_LABEL_QUERY_URL}&ids=${ids.join("|")}`;

const processLabelQueryResult = (r: {
  success: number;
  entities: Record<string, any>;
}) => {
  if (r.success !== 1) return undefined;
  //
  const ent = r.entities ?? ({} as Record<string, any>);
  //
  const mapEntry = ([q, res]: any) => [q, res.labels?.en?.value ?? ""];
  const kvps = Object.entries(ent).map(mapEntry);
  //
  return Object.fromEntries(kvps);
};

const useWikiLabels = (
  ids: Array<string>
): { loading: boolean; labels: Record<string, string> | undefined } => {
  const [loading, setLoading] = useState<boolean>(false);
  const [labels, setLabels] = useState<Record<string, string> | undefined>();
  //
  useEffect(() => {
    if (ids.length === 0) setLabels({});
    else if (ids.length < MAX_ID_PER_CALL) {
      const abortController = new AbortController();
      //
      const url = urlFromIds(ids);
      //
      setLoading(true);
      //
      fetch(url, { method: "GET", signal: abortController.signal })
        .then((res) => res.json())
        .then(processLabelQueryResult)
        .then((labels) => {
          if (!abortController.signal.aborted) {
            setLabels(labels);
          }
        })
        .finally(() => setLoading(false));
      //
      return () => {
        abortController.abort();
      };
    } else {
      //
      // reading two pages
      //
      const max = MAX_ID_PER_CALL;
      const firstPage = ids.slice(0, max);
      const secondPage = ids.slice(max).slice(0, max);
      //
      const firstUrl = urlFromIds(firstPage);
      const secondUrl = urlFromIds(secondPage);
      //
      const acFirst = new AbortController();
      const acSecond = new AbortController();
      //
      const load = (url: string, ac: AbortController) => {
        return fetch(url, { method: "GET", signal: ac.signal })
          .then((res) => res.json())
          .then(processLabelQueryResult);
      };
      //
      const promises = [load(firstUrl, acFirst), load(secondUrl, acSecond)];
      //
      // requesting data, and merging result
      //
      setLoading(true);
      //
      Promise.all(promises)
        .then(([first, second]) => {
          const ok = !acFirst.signal.aborted && !acSecond.signal.aborted;
          //
          if (ok) setLabels({ ...first, ...second });
        })
        .finally(() => setLoading(false));
      //
      // on effect cleanup, abort both calls
      //
      return () => {
        acFirst.abort();
        acSecond.abort();
      };
    }
    //
  }, [ids]);
  //
  return useMemo(
    () =>
      loading || ids.length === 0
        ? { loading: true, labels: undefined }
        : { loading, labels },
    [ids, loading, labels]
  );
};

export default useWikiLabels;
