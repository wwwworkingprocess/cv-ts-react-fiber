import { useMemo } from "react";

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
  P4080: { "name": "number of houses" },
  P6343: { "name": "urban population" },
  P6344: { "name": "rural population" },
  P6498: { "name": "illiterate population" },
  P6499: { "name": "literate population" },
};
*/
import propsMeta from "../../assets/json/wiki/properties.labels.json";
import useWikiLabels from "./useWikiLabels";

const accessors = {
  url: (v: any) => (v ? v.value : ""),
  string: (v: any) => (v ? v.value : "[N.A.]"),
  "external-id": (v: any) => {
    if (v === undefined) return ""; // when received data is errorous e.g. props of Q922851
    //
    return v.value; // e.g. '/m/02r2yz_'
  },
  commonsMedia: (v: any) => (v ? v.value : ""),
  "geo-shape": (v: any) => v.value, // e.g. Data:Hungary/Szekszárd.map
  //
  monolingualtext: (v: any) => (v && v.value ? v.value.text : "[N.A.]"),
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
      // const isUnitLess = v.value.unit === "1";
      // const hasPunctuation = v.value.amount.indexOf(".") > -1;
      //

      const a = v.value.amount;
      //
      // console.log(
      //   "in quantity",
      //   isUnitLess,
      //   hasPunctuation,
      //   a,
      //   v.value.unit,
      //   "->",
      //   parseFloat(a)
      // );
      //
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
export const useWikiEntityReader = (wikiEntry: any) => {
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
    // Selecting the prefered claim from the claims,
    // or the last entry when there is no prefered claim
    //
    const findPreferedClaim = (raw: Array<any>) => {
      if (!raw.length) return undefined;
      //
      const prefered = raw.find((claim) => claim.rank === "prefered");
      const claim = prefered ?? raw[raw.length - 1];
      //
      return claim;
    };

    //
    // Reading the prefered value for every claim
    //
    const values = known.map((entry) => {
      const l = entry.raw.length;
      const preferedValue = findPreferedClaim(entry.raw);
      //
      // reading a single statement (preferedValue)
      //
      const type = findType(preferedValue);
      const val = readValue(preferedValue);
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
