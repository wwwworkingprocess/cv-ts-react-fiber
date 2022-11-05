import { Color } from "three";
import externalMap from "../assets/json/wiki/properties.formatterurls.json";

const formatterUrls = externalMap as Record<string, any>;

export const toWikiCommonsMediaUrl = (
  mediaName: string,
  width?: number
): string =>
  `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${mediaName}&width=${
    width ?? 300
  }`;

export const hasFormatterUrl = (propertyCode: string) =>
  formatterUrls[propertyCode] !== undefined;

export const toExternalSourceUrl = (propertyCode: string, value: string) => {
  const idPlaceholder = "###ID###";
  const formatterUrl = (formatterUrls[propertyCode] ?? "") as string;
  //
  return formatterUrl.includes(idPlaceholder)
    ? formatterUrl.replaceAll(idPlaceholder, value)
    : `${formatterUrl}${value}`;
};

const colorByPop = (node: any) => {
  const toValue = (node: any): number =>
    Math.log(Math.max(0, node?.data?.pop ?? 0)) * 14 + 10;
  const [r, g, b] = [Math.max(0, 155 - toValue(node) * 0.35), toValue(node), 0];
  //
  const hex = new Color(r / 256, g / 256, b / 256).getHexString();
  //
  return `#${hex}`;
};
//
const scaleByPop = (node: any) => {
  const toValue = (node: any): number =>
    Math.log(Math.max(200, node?.data?.pop ?? 0)) * 0.25;
  //
  const v = Math.max(0.1, toValue(node)) * 0.12;
  //
  return [v, v, v];
};
export const toDisplayNode = (node: any, toWorldPosition: any) => {
  return {
    code: node.code,
    name: node.name,
    pop: node.data.pop,
    position: toWorldPosition(node),
    color: colorByPop(node),
    scale: scaleByPop(node),
  };
};

export const formatPopulation = (p: number, omitEmoji?: boolean) => {
  const suffix = !omitEmoji ? "🧍" : "";
  //
  if (p === -1) return "";
  if (p < 1000) return `${p}${suffix}`;
  if (p < 1000000) return `${(p * 0.001).toFixed(1)}k ${suffix}`;
  else return `${(p * 0.000001).toFixed(1)}M ${suffix}`;
};
