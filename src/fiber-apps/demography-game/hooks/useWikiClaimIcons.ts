import { useCallback, useMemo } from "react";

const toImageOrUnit = (propertyName: string) => {
  return propertyName === "Commons category"
    ? "https://commons.wikimedia.org/static/images/project-logos/commonswiki.png"
    : "";
};
//
const toIconOrUnit = (propertyName: string) => {
  //
  // exact
  //
  if (propertyName === "motto text") return `✍`;
  if (propertyName === "hashtag") return `#`;
  if (propertyName === "inception") return `⌛`;
  if (propertyName === "time of discovery or invention") return `⌛`;
  if (propertyName === "social media followers") return `🧍`;
  if (propertyName === "number of households") return `🏠`;
  if (propertyName === "number of houses") return `🏠`;
  if (propertyName === "geoshape") return `🗾`;
  if (propertyName === "area") return `🗾`;
  if (propertyName === "postal code") return `📫`;

  if (propertyName === "official map URL") return `🧭`;
  if (propertyName === "official website") return `🌐`;
  if (propertyName === "described at URL") return `🌐`;

  if (propertyName === "IATA airport code") return `🛬`;
  if (propertyName === "phone number") return `📞`;
  if (propertyName === "mobile country code") return `☎`;
  if (propertyName === "minimum temperature record") return `❄`;
  if (propertyName === "maximum temperature record") return `🔥`;
  if (propertyName === "streaming media URL") return `📹`;
  if (propertyName === "Commons gallery") return `📷`;
  if (propertyName === "native label") return `📗`;
  if (propertyName === "demonym") return `📓`;
  if (propertyName === "mains voltage") return `⚡`;
  if (propertyName === "catalog code") return `📑`;
  if (propertyName === "time of earliest written record") return `📜`;
  if (propertyName === "water as percent of area") return `🌊`;
  if (propertyName === "water area") return `🌊`;
  if (propertyName === "marriageable age") return `💒`;
  if (propertyName === "retirement age") return `🧓`;
  if (propertyName === "life expectancy") return `👴`;
  if (propertyName === "email address") return `@`;
  if (propertyName === "coastline") return `🗾`;

  //
  // match
  //
  if (propertyName.includes("elevation")) return `⛰`;

  if (propertyName.includes("coordinate")) return `🌍`;
  if (propertyName.startsWith("compulsory education")) return `🏫`;
  if (propertyName.startsWith("oordinates of")) return `🌍`; // ???
  if (propertyName.startsWith("licence plate")) return `🚗`;
  if (propertyName.startsWith("vehicles per")) return `🚗`;
  if (propertyName.endsWith("Index")) return `%`;
  if (propertyName.endsWith("rate")) return `%`;
  if (propertyName.endsWith("wage")) return `💴`;
  if (propertyName.endsWith("income")) return `💴`;
  if (propertyName.endsWith("name")) return `📘`;
  if (propertyName.endsWith("population")) return `🧍`;
  if (propertyName.endsWith("dialing code")) return `☎`;
  if (propertyName.endsWith("country calling code")) return `☎`;

  return "";
};
//
//
//
const useWikiClaimIcons = () => {
  //
  const toClaimIcon = useCallback(
    (
      property: any
    ): {
      value: string;
      isImage: boolean;
    } => {
      const image = toImageOrUnit(property.name);
      const icon = toIconOrUnit(property.name);
      //
      return { value: image || icon, isImage: Boolean(image) };
    },
    []
  );
  //
  return useMemo(() => ({ toClaimIcon }), [toClaimIcon]);
};

export default useWikiClaimIcons;
