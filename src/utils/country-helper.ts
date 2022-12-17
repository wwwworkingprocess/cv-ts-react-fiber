import { WikiCountry } from "./firebase/repo/wiki-country.types";
import TreeHelper from "./tree-helper";

import countryBoundsRaw from "../assets/json/wiki/countries.bounds.json";

const availableCountryCodes = [
  "Q17",
  "Q20",
  "Q27",
  "Q28",
  "Q30",
  "Q31",
  "Q32",
  "Q33",
  "Q34",
  "Q35",
  "Q36",
  "Q37",
  "Q38",
  "Q40",
  "Q41",
  "Q43",
  "Q45",
  "Q55",
  "Q77",
  "Q115",
  "Q117",
  //
  "Q155",
  "Q183",
  "Q184",
  "Q189",
  "Q191",
  "Q211",
  "Q212",
  "Q213",
  "Q214",
  "Q215",
  "Q217",
  "Q218",
  "Q219",
  "Q221",
  "Q222",
  "Q224",
  "Q225",
  "Q227",
  "Q228",
  "Q229",
  "Q230",
  "Q232",
  "Q233",
  "Q236",
  "Q238",
  "Q241",
  "Q242",
  "Q244",
  "Q252",
  "Q258",
  "Q262",
  "Q334",
  "Q347",
  "Q398",
  "Q399",
  "Q403",
  "Q408",
  "Q668",
  "Q801",
  "Q1016",
];

const zoomFixes = {
  Q16: 23,
  Q17: 17,
  Q20: 19.5,
  Q27: 11,
  Q28: 10,
  Q29: 22.5,
  Q30: 21,
  Q31: 6,
  Q32: -16,
  Q33: 17,
  Q34: 20.5,
  Q35: 21, // TODO: check bounds data for Denmark
  Q36: 15,
  Q37: 0,
  Q38: 21,
  Q40: 4,
  Q41: 18,
  Q43: 18,
  Q45: 20,
  Q55: 23.5,
  Q77: 8,
  Q96: 21.6,
  Q115: 21.1,
  Q117: 18.5,
  Q142: 19,
  Q145: 19.8,
  Q148: 21.6,
  Q155: 23.9,
  Q159: 23,
  Q183: 18,
  Q184: 14,
  Q189: 7.6,
  Q191: 1,
  Q211: 1,
  Q212: 17,
  Q213: 6,
  Q214: 6,
  Q215: -3,
  // Q215: -17,
  Q217: 7.4,
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
  Q334: -18,
  Q347: -20,
  Q398: 0,
  Q399: 0,
  Q403: 13,
  Q408: 21.8,
  Q668: 22,
  Q794: 20.6,
  Q801: 13.4,
  Q805: 17.6,
  Q1016: 21.4,
  Q1028: 21.8,
  Q1032: 20.7,
  //
  //
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

export const beautifyAdminOneName = (countryCode: number, s: string) => {
  if (!s) {
    console.log("INVALID NAME", s);
  }
  switch (countryCode) {
    case 28:
      return (s ?? "").replaceAll(" County", "").replaceAll(" District", "");
    case 34:
      return (s ?? "").replaceAll(" County", "");
    case 43:
      return (s ?? "").replaceAll(" Province", "");
    case 77:
      return (s ?? "").replaceAll(" Department", "");
    case 117:
      return (s ?? "").replaceAll(" Region", "");
    case 191:
      return (s ?? "").replaceAll(" County", "");
    case 211:
      return (s ?? "").replaceAll(" Municipality", "");
    case 212:
      return (s ?? "").replaceAll(" Oblast", "");
    case 214:
      return (s ?? "").replaceAll(" Region", "").replaceAll(" region", "");
    case 224:
      return (s ?? "").replaceAll(" County", "");
    case 227:
      return (s ?? "").replaceAll(" District", "");
    case 229:
      return (s ?? "").replaceAll(" District", "");
    case 232:
      return (s ?? "").replaceAll(" Region", "");
    case 241:
      return (s ?? "").replaceAll(" Province", "");
    case 334:
      return (s ?? "").replaceAll(" Region", "");
    case 398:
      return (s ?? "").replaceAll(" Governorate", "");
    case 801:
      return (s ?? "").replaceAll(" District", "");
    case 1016:
      return (s ?? "").replaceAll(" District", "");
    default:
      return s ? s : "";
  }
};
