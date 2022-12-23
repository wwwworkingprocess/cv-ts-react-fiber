import { useEffect, useMemo, useState } from "react";

type ImageRawEntry = { type: string; value: string };

const MAX_ID_PER_CALL = 50;

const valuesSelectionFromIds = (ids: Array<string>) =>
  ids.map((id) => `wd:${id}`).join(" ");

const processImageQueryResult = (r: {
  head: { vars: Array<any> };
  results: {
    bindings: Array<{ s: ImageRawEntry; image: ImageRawEntry }>;
  };
}) => {
  //
  const bindings = r.results?.bindings || [];
  //
  const codeFromUrl = (url: string) =>
    url.replace("http://www.wikidata.org/entity/", "");
  const thumbnailUrlFromImageUrl = (imageUrl: string) => {
    const imageWidth = 95;
    const locator = imageUrl.replace("http://commons.wikimedia.org/wiki/", "");
    const redirectRoot = "https://commons.wikimedia.org/w/index.php?title=";
    //
    const url = `${redirectRoot}${locator}&width=${imageWidth}`;
    return url;
  };

  const entries = bindings.map((b) => [
    codeFromUrl(b.s.value),
    thumbnailUrlFromImageUrl(b.image.value),
  ]);
  //
  return Object.fromEntries(entries);
};

const queryTemplateImages = `SELECT DISTINCT ?s ?image 
WHERE {
  SELECT ?s ?image WHERE {
      VALUES ?s { ###SELECTION### }
      ?s wdt:P18 ?image
  }
}
LIMIT ###LIMIT###`;

const useWikiImages = (
  ids: Array<string>,
  limit: number,
  explicitProperty?: string | undefined
): { loading: boolean; images: Record<string, string> | undefined } => {
  const [loading, setLoading] = useState<boolean>(false);
  const [images, setImages] = useState<Record<string, string> | undefined>();

  //
  // Creating the specific query based on the generic template
  //
  const currentQuery = useMemo(() => {
    const template = queryTemplateImages;
    const selection = valuesSelectionFromIds(ids);
    //
    const query = template
      .replace("###SELECTION###", selection)
      .replace("###LIMIT###", String(limit));
    //
    //
    return explicitProperty ? query.replace("P18", explicitProperty) : query;
  }, [ids, limit, explicitProperty]);

  //
  // Retrieving the associated (image) property values for the provided ids
  //
  useEffect(() => {
    if (ids.length === 0) setImages({});
    else if (ids.length <= MAX_ID_PER_CALL) {
      const abortController = new AbortController();
      //
      // Preparing query
      // 1. format identifiers (Q403 --> wd:Q403)
      // 2. create query
      // 3. execute query
      // 4. format results
      //
      const query = currentQuery;
      //
      setLoading(true);
      //
      const escapeQuery = (q: string): string =>
        q.replaceAll(" ", "%20").replaceAll("\n", "%20");
      const escapedQuery = escapeQuery(query);
      //
      const url = `https://query.wikidata.org/sparql?format=json&query=${escapedQuery}`;
      //
      fetch(url, { method: "GET", signal: abortController.signal })
        .then((res) => res.json())
        .then(processImageQueryResult)
        .then((images) => {
          if (!abortController.signal.aborted) {
            setImages(images);
          }
        })
        .finally(() => setLoading(false));
      //TODO: no catch on fail
      //
      return () => {
        abortController.abort();
      };
    } else {
      console.warn("Reduce input list length.");
      setImages({});
    }
    //
  }, [ids, currentQuery]);

  //
  // Returning memoized result
  //
  return useMemo(
    () =>
      loading || ids.length === 0
        ? { loading: true, images: undefined }
        : { loading, images },
    [ids, loading, images]
  );
};

export default useWikiImages;
