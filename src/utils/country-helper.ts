import { WikiCountry } from "./firebase/repo/wiki-country.types";
import TreeHelper from "./tree-helper";

import countryBoundsRaw from "../assets/json/wiki/countries.bounds.json";

const availableCountryCodes = [
  "Q20",
  "Q27",
  "Q28",
  "Q31",
  "Q32",
  "Q33",
  "Q41",
  "Q45",
  "Q55",
  "Q77",
  "Q155",
  "Q184",
  "Q189",
  "Q191",
  "Q211",
  "Q221",
  "Q222",
  "Q224",
  "Q225",
  "Q228",
  "Q233",
  "Q236",
  "Q238",
  "Q241",
  "Q242",
  "Q244",
  "Q252",
  "Q258",
  "Q262",
];

const availableCountryCodesOld = [
  "Q16",
  "Q17",
  "Q20",
  "Q27",
  "Q28",
  "Q29",
  // "Q30", USA disabled, state level missing from hierarchy
  "Q31",
  "Q34",
  "Q37",
  "Q38",
  "Q41",
  "Q45",
  "Q55",
  "Q96",
  "Q142",
  "Q145",
  "Q148",
  "Q155",
  "Q159",
  "Q183",
  "Q184",
  "Q189", // Iceland, checking new parent-finder
  "Q191",
  "Q211",
  "Q212",
  "Q213",
  // "Q215", // Slovenia removed, invalid hierarchy
  "Q218",
  "Q219",
  "Q221",
  "Q222",
  "Q224",
  "Q225",
  // "Q225", // Bosnia and H. removed, invalid hierarchy
  "Q227",
  "Q228", // Andorra, best to debug hierarchy issue
  "Q229",
  "Q230",
  "Q232",
  "Q233",
  "Q236",
  "Q238", // Montenegro
  "Q241",
  "Q242",
  "Q244",
  "Q252",
  "Q258",
  "Q262",
  "Q403",
  "Q408",
  "Q668",
  "Q794",
  "Q805",
  "Q1028",
  "Q1032",
  //
  "Q191",
  "Q217",
  "Q399",
  "Q1246",
];

const zoomFixes = {
  Q16: 23,
  Q17: 17,
  Q20: 19.5,
  Q27: 11,
  Q28: 10,
  Q29: 22.5,
  // Q30: 21,
  Q31: 6,
  Q32: -16,
  Q33: 17,
  Q34: 20.5,
  Q37: 0,
  Q38: 21,
  Q41: 18,
  Q45: 20,
  Q55: 23.5,
  Q77: 8,
  Q96: 21.6,
  Q142: 19,
  Q145: 19.8,
  Q148: 21.6,
  Q155: 23.9,
  Q159: 23,
  Q183: 20,
  Q184: 14,
  Q189: 7.6,
  Q191: 1,
  Q211: 1,
  Q212: 17,
  Q213: 6,
  // Q215: -17,
  Q218: 17,
  Q219: 10,
  Q221: 0,
  Q222: 8,
  Q224: 11,
  Q225: 7,
  Q227: 9,
  Q228: -10,
  Q229: -8,
  Q230: 3.6,
  Q232: 21.6,
  Q233: -20,
  Q236: 0,
  Q238: -17,
  Q241: 16.6,
  Q242: 0,
  Q244: -20,
  Q252: 21.5,
  Q258: 20,
  Q262: 22.2,
  Q403: 13,
  Q408: 21.8,
  Q668: 22,
  Q794: 20.6,
  Q805: 17.6,
  Q1028: 21.8,
  Q1032: 20.7,
  //
  //
  Q217: 7.4,
  Q399: 0,
  Q1246: 0,
} as Record<string, number>;

/**
 *  Returns bounds as an array, [min_lng, max_lng, min_lat, max_lat]
 */
type RawBounds = [number, number, number, number];
const bounds = Object.fromEntries(
  Object.entries(countryBoundsRaw).map(([code, c]: [code: string, c: any]) => [
    code,
    c.bb,
  ])
) as Record<string, RawBounds>;

// const bounds = {
//   /*HU*/ Q28: [16.20229, 22.71053, 45.75948, 48.62385],
//   /*SI*/ Q215: [13.6981, 16.5648, 45.45231, 46.85238],
//   /*RO*/ Q218: [20.22019, 29.62654, 43.68844, 48.22088],
//   //
// } as Record<string, RawBounds>;

/**
 * @returns Codes of countries, enabled for the 3D map
 */
export const getAvailableCountryCodes = () => availableCountryCodes;

/**
 * Retrieve country bounds information by code
 *
 * @param code Code of country, string (e.g. Q28)
 * @returns Array of floats, [min_lng, max_lng, min_lat, max_lat]
 */
export const getCountryBoundsByCode = (code: string): RawBounds | undefined => {
  const b = bounds[code];
  //
  if (!b) console.warn("missing bounds data for ", code, b);
  //
  return b;
};

/**
 * Retrieve country nodes list from TreeHelper, and cleaning result per country when necessary
 *
 * @param code Code of country, string (e.g. Q28)
 * @returns Array of floats, [min_lng, max_lng, min_lat, max_lat]
 */
export const getCountryNodesFromTree = (
  country: WikiCountry,
  tree: TreeHelper
): Array<any> => {
  const valid = getAvailableCountryCodes().includes(country.code);
  //
  if (valid) {
    const all = tree.list_all();
    //
    switch (country.code) {
      case "Q28":
        return all.slice(143); // skip continents and countries except hungary
      default:
        return all;
    }
  }
  //
  return [];
};

/**
 * Retrieve country zoom fix value, applied when zoomed out.
 * Zero means, no change, the higher the value [0..15], the larger the view
 *
 * @param code Code of country, string (e.g. Q28)
 * @returns Array of floats, [min_lng, max_lng, min_lat, max_lat]
 */
export const getCountryZoomFixByCode = (code: string): number => {
  const zf = zoomFixes[code];
  //
  if (!zf) return 0;
  //
  return zf;
};
