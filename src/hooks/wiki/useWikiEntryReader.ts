import { useEffect, useMemo, useState } from "react";

/*
Useful properties: 

const propsMeta = {
  P17: { name: "country" },
  P18: { name: "image" },
  P31: { name: "instance of" },
  P41: { name: "flag image" },
  P281: { name: "postal code" },
  P300: { name: "ISO 3166-2 code" },
  P571: { name: "inception" },
  P625: { name: "coordinate location" },
  P856: { name: "official website" },
  P1082: { name: "population" },
  P1538: { "name": "number of households" },
  P1539: { "name": "female population" },
  P1540: { "name": "male population" },
  P2044: { name: "elevation above sea level" },
  P2046: { name: "area" },
  P3896: { name: "geoshape" },
  P6343: { "name": "urban population" },
  P6344: { "name": "rural population" },
  P6498: { "name": "illiterate population" },
  P6499: { "name": "literate population" },
};
*/
import propsMeta from "../../assets/json/wiki/properties.labels.json";
import useWikiLabels from "./useWikiLabels";

const WIKI_LABEL_QUERY_URL =
  "https://www.wikidata.org/w/api.php?action=wbgetentities&props=labels&languages=en&format=json&origin=*";

const accessors = {
  url: (v: any) => v.value,
  string: (v: any) => (v ? v.value : "[N.A.]"),
  "external-id": (v: any) => {
    if (v === undefined) return ""; // when received data is errorous e.g. props of Q922851
    //
    return v.value; // e.g. '/m/02r2yz_'
  },
  commonsMedia: (v: any) => v.value,
  "geo-shape": (v: any) => v.value, // e.g. Data:Hungary/Szekszárd.map
  //
  monolingualtext: (v: any) => v.value.text,
  //
  "wikibase-item": (v: any) => (v && v.value ? v.value.id : ""), // e.g. Q2590631
  //
  "globe-coordinate": (v: any) => {
    if (v === undefined) return "No data."; // consider empty
    //
    return `[${v.value.latitude.toFixed(5)}, ${v.value.longitude.toFixed(5)}]`;
  },
  //
  quantity: (v: any) => {
    let q = 0.0;
    //
    //TODO: ignoring unit atm
    //
    try {
      const a = v.value.amount;
      q = parseFloat(a);
    } catch (ex) {
      console.error("unable to parse property value");
    }
    return q;
  },
  //
  time: (v: any) => {
    let t = undefined;
    //
    try {
      const s = v.value.time;
      const d = s[0] === "+" ? s.substring(1) : s; //TODO: times before b.c.
      const dt = new Date(d);
      //
      t = JSON.stringify(dt);
      //
      t = t === "null" ? d : t.replaceAll('"', "");
      t = t.replace("T00:00:00.000Z", "");
      //
    } catch (ex) {
      console.error("unable to parse property value");
    }
    return t;
  },
} as Record<string, (v: any) => any>;

const findType = (st: any) =>
  st ? st.mainsnak?.datatype ?? "null" : undefined;
const readValue = (st: any) => (st ? st.mainsnak?.datavalue : undefined);
const toRawResult = ([code, claim]: [string, any]) => ({
  code,
  property: { code, ...(propsMeta as Record<string, any>)[code] },
  raw: claim,
});

//
//
//
export const useWikiEntryReader = (wikiEntry: any) => {
  const name = useMemo(
    () => (wikiEntry ? String(wikiEntry.labels["en"]?.value ?? "") : undefined),
    [wikiEntry]
  );

  //
  const claimsMeta = useMemo(() => {
    if (!wikiEntry) return undefined;
    //
    const kvps = Object.entries(wikiEntry.claims).map(toRawResult);
    //
    const knownCodes = Object.keys(propsMeta);
    const known = kvps.filter((entry) => knownCodes.includes(entry.code));
    const unknown = kvps
      .filter((entry) => !knownCodes.includes(entry.code))
      .map((kvp) => ({ code: kvp.code, value: kvp.raw }));
    //
    const values = known.map((entry) => {
      const l = entry.raw.length;
      const first = entry.raw[0];
      //
      // only first statement used at the moment ( l = 1)
      //
      const type = findType(first);
      const val = readValue(first);
      //
      const accessor = accessors[type];
      const value = accessor ? accessor(val) : undefined;
      //
      return { type, ...entry, l, val, value };
    });

    return { values, other: unknown };
  }, [wikiEntry]);

  //
  const ids = useMemo(() => {
    if (claimsMeta) {
      const isWikiItem = (c: { type: string }) => c.type === "wikibase-item";
      const isValid = (c: { val?: any }) => c.val && c.val.value;
      //
      return claimsMeta.values
        .filter(isWikiItem)
        .filter(isValid)
        .map((c) => c.val.value.id) as Array<string>;
    }
    //
    return [] as Array<string>;
  }, [claimsMeta]);

  //
  const { loading, labels } = useWikiLabels(ids);

  //
  //
  //
  return useMemo(
    () =>
      !loading
        ? { name, labels, claimsMeta }
        : { name: undefined, labels: undefined, claimsMeta: undefined },
    [loading, name, labels, claimsMeta]
  );
};

//
//TODO: running a sparql query
//
// const query = "SELECT ?dob WHERE {wd:Q42 wdt:P569 ?dob.}";
// const escapeQuery = (q: string): string => q.replaceAll(" ", "%20").replaceAll("\n", " ");
// const escapedQuery = escapeQuery(query); // SELECT%20?dob%20WHERE%20{wd:Q42%20wdt:P569%20?dob.}
// console.log("running effect escapedQuery", escapedQuery);
// const url = `https://query.wikidata.org/sparql?format=json&query=${escapedQuery}`;
//
