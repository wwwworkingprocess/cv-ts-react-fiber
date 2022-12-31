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
  // "Q96", Mexico - dataset too large
  "Q115",
  "Q117",
  //
  "Q145",
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
  //
  "Q414",
  "Q419",
  "Q423",
  "Q424",
  "Q574",
  "Q657",
  "Q664",
  "Q668", // india
  "Q678",
  "Q686",
  "Q697",
  "Q702",
  "Q709",
  "Q710",
  "Q711",
  "Q712",
  "Q717",
  "Q730",
  "Q733",
  "Q734",
  "Q736",
  "Q739",
  "Q750",
  "Q754",
  "Q757",
  "Q760",
  "Q763",
  //
  "Q766",
  "Q769",
  "Q774",
  "Q778",
  "Q781",
  "Q783",
  "Q784",
  "Q786",
  "Q792",
  "Q794",
  "Q796",
  "Q800",
  "Q801",
  "Q805",
  "Q810",
  "Q811",
  "Q813",
  "Q817",
  "Q819",
  "Q822",
  "Q826",
  "Q833",
  "Q837",
  "Q842",
  "Q843",
  "Q846",
  "Q851",
  "Q854",
  "Q858",
  "Q863",
  // "Q865", // ???????????????????????????? tree not loading
  "Q869",
  "Q874",
  "Q878",
  "Q881",
  "Q884",
  "Q889",
  "Q902",
  "Q912",
  "Q916",
  "Q917",
  //
  "Q924",
  "Q928",
  "Q929",
  // "Q929",
  // "Q945",
  "Q948",
  // "Q953",
  // "Q954",
  "Q958",
  "Q962",
  "Q963",
  "Q965",
  "Q967",
  "Q970",
  "Q971",
  "Q974",
  "Q977",
  "Q983",
  "Q986",
  "Q1000",
  "Q1005",
  "Q1006",
  // "Q1007",
  "Q1008",
  "Q1009",
  //
  "Q1016",
  //
  "Q1019",
  "Q1025",
  "Q1027",
  "Q1028",
  "Q1029",
  "Q1030",
  "Q1032",
  "Q1033",
  "Q1036",
  "Q1037",
  "Q1039",
  "Q1041",
  "Q1042",
  "Q1044",
  "Q1049",
  "Q1050",
  "Q1246",
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

  Q414: 22.5,
  Q419: 20.7,
  Q423: 5,
  Q424: 7,
  Q574: -3,
  Q657: 21.6,
  Q664: 23.9, // invalid or missing bb
  Q668: 22, // india
  Q678: -8,
  Q686: 0,
  Q697: -18,
  Q702: 17,
  Q709: 5,
  Q710: 17, // invalid bb
  Q711: 17.5,
  Q712: 23, // invalid bb or missing bb
  Q717: 20,
  Q730: 14.5,
  Q733: 17,
  Q734: 19,
  Q736: 18.5,
  Q739: 20.5,
  Q750: 20.3,
  Q754: -2,
  Q757: -13,
  Q760: -14,
  Q763: -19, //TODO: only unlinked nodes in tree
  Q766: -2, // invalid bb
  Q769: -17,
  Q774: 6,
  Q778: 14,
  Q781: -14,
  Q783: 3,
  Q784: -11,
  Q786: 8.6,
  Q792: -2,
  Q794: 20.6,
  Q796: 19.2,
  Q800: 13, // invalid bb
  Q801: 13.4,
  Q805: 17.6,
  Q810: 14.9,
  Q811: 9,
  Q813: 14,
  Q817: 0,
  Q819: 9,
  Q822: 2,
  Q826: 18.7,
  Q833: 20.6, // invalid bb
  Q837: 4.7,
  Q842: 20.7,
  Q843: 20.9,
  Q846: 1.5,
  Q851: 22.5,
  Q854: 9.5,
  Q858: 16.6,
  Q863: 12.9, // invalid bb
  // Q865: 0,
  Q869: 16.9,
  Q874: 15.2,
  Q878: 12,
  Q881: 17.7, // invalid bb
  Q884: 2,
  Q889: 19,
  Q902: 7,
  Q912: 21.9,
  Q916: 21.4,
  Q917: 0,
  //
  Q924: 20.8,
  Q928: 14.4,
  Q929: 19.9,
  // Q929: 0,
  // Q945: 0,
  Q948: 18.8,
  // Q953: 0,
  // Q954: 0,
  Q958: 23.2, //TODO: invalid bb
  Q962: 18,
  Q963: 20,
  Q965: 17,
  Q967: 7,
  Q970: 0,
  Q971: 20,
  Q974: 22.4,
  Q977: 4,
  Q983: 8, //TODO: invalid bb
  Q986: 17,
  Q1000: 18,
  Q1005: -8,
  Q1006: 16.5,
  // Q1007: 0,
  Q1008: 17.6,
  Q1009: 20.7,
  //
  Q1016: 21.4,

  //
  //
  Q1019: 21.4,
  Q1025: 19,
  Q1027: 21, //TODO: add P2441
  Q1028: 21.8, // invalid bb
  Q1029: 21.7, //TODO: add P9760
  Q1030: 21.3,
  Q1032: 21.2,
  Q1033: 20.6, //TODO: add P3938
  Q1036: 17.6,
  Q1037: 4,
  Q1039: 4,
  Q1041: 16,
  Q1042: 18,
  Q1044: 12,
  Q1049: 21.8,
  Q1050: 0,
  Q1246: 20, //TODO: missing bb
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
    case 399:
      return (s ?? "").replaceAll(" Region", "").replaceAll(" Province", "");
    //
    case 414:
      return (s ?? "").replaceAll(" Province", "");
    //
    case 796:
      return (s ?? "").replaceAll(" Governorate", "");
    case 800:
      return (s ?? "").replaceAll(" Province", "");
    case 801:
      return (s ?? "").replaceAll(" District", "");
    case 805:
      return (s ?? "").replaceAll(" Governorate", "");
    case 810:
      return (s ?? "").replaceAll(" Governorate", "");
    case 811:
      return (s ?? "").replaceAll(" Department", "");
    case 813:
      return (s ?? "").replaceAll(" Region", "");
    case 842:
      return (s ?? "").replaceAll(" Governorate", "");
    case 851:
      return (s ?? "").replaceAll(" Province", "");
    case 858:
      return (s ?? "").replaceAll(" Governorate", "");
    case 863:
      return (s ?? "").replaceAll(" Rayon", "").replaceAll(" District", "");
    case 874:
      return (s ?? "").replaceAll(" Region", "");
    case 878:
      return (s ?? "").replaceAll("Emirate of ", "");
    case 902:
      return (s ?? "").replaceAll(" Division", "");
    case 916:
      return (s ?? "").replaceAll(" Province", "");
    case 1016:
      return (s ?? "").replaceAll(" District", "");
    default:
      return s ? s : "";
  }
};
