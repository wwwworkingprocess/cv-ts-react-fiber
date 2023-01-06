import { AvailableCountryCodes } from "./available-countries";

export const zoomFixes = {
  //
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
  Q39: 2,
  Q40: 4,
  Q41: 18,
  Q43: 18,
  Q45: 20,
  Q55: 23.5,
  Q77: 8,
  Q79: 20.6,
  Q96: 21.6,
  Q114: 20.6,
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
  Q235: -20,
  Q236: 0,
  Q238: -17,
  Q241: 16.6,
  Q242: 0,
  Q244: -20,
  Q252: 21.5,
  Q258: 20,
  Q262: 22.2,
  Q265: 15,
  Q298: 23.1, // TODO: fix bounding box
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
  Q672: -14,
  Q678: -8,
  Q683: -16,
  Q685: 11, //TODO: add P7704
  Q686: 0,
  Q691: 16,
  Q695: 5,
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
  Q790: 6, //TODO: add P1370
  Q792: -2,
  Q794: 20.6,
  Q796: 19.2,
  Q800: 13, // invalid bb
  Q801: 13.4,
  Q804: 12,
  Q805: 17.6,
  Q810: 14.9,
  Q811: 9,
  Q813: 14,
  Q817: 0,
  Q819: 9,
  Q822: 2,
  Q826: 18.7,
  Q833: 20.6, // invalid bb
  Q836: 19.4,
  Q837: 4.7,
  Q842: 20.7,
  Q843: 20.9,
  Q846: 1.5,
  Q851: 22.5,
  Q854: 9.5,
  Q858: 16.6,
  Q863: 12.9, // invalid bb
  Q865: 16.6, // invalid bb  TODO: add P5020
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
  Q921: -17,
  Q924: 20.8,
  Q928: 14.4,
  Q929: 19.9,
  Q945: 17,
  Q948: 18.8,
  Q953: 20.4,
  Q954: 18.6,
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
  Q1007: 5,
  Q1008: 17.6,
  Q1009: 20.7,
  Q1011: 11, // TODO: add P868
  Q1013: 5,
  Q1014: 16,
  Q1016: 21.4,
  Q1019: 21.4,
  Q1020: 19.7,
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
  Q1045: 22,
  Q1049: 21.8,
  Q1050: 0,
  Q1246: 20, //TODO: missing bb
} as Record<AvailableCountryCodes, number>;
