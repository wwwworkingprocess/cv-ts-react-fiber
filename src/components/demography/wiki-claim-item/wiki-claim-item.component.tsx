import { useMemo } from "react";
import { toWikiCategoryEntryUrl, toWikiEntryUrl } from "../../../utils/wiki";
import {
  WikiClaimItemCaption,
  WikiClaimItemContainer,
  WikiClaimItemContent,
} from "./wiki-claim-item.styles";

type WikiClaimIconProps = {
  property: any; // onClicked: (p: any) => void;
  claimEnvelope: {
    type: string;
    val: any;
    value: string;
    l: number;
  };
};

const toExternalUrl = (url: string, title: string) => {
  let s = url;
  //
  if (s.startsWith("http://")) s = s.replace("http://", "");
  if (s.startsWith("https://")) s = s.replace("https://", "");
  if (s.startsWith("www.")) s = s.replace("www.", "");
  if (s.endsWith("/")) s = s.substring(0, s.length - 1);

  return (
    <a
      href={url}
      title={title}
      target="_blank"
      rel="noreferrer"
      style={{ color: "gold", fontSize: "12px" }}
    >
      {s}
    </a>
  );
};

const renderLink = (href: string, title: string, value: string) => (
  <a target="_blank" rel="noreferrer" title={title} href={href}>
    {value}
  </a>
);

const shortenTime = (datetime: string) => {
  let s = (datetime ?? "").trim();
  //
  if (s.endsWith("-00-00T00:00:00Z")) s = s.replace("-00-00T00:00:00Z", ".");
  if (s.endsWith("T00:00:00Z")) s = s.replace("T00:00:00Z", "");
  //
  if (s.startsWith("-0")) s = `${parseInt(s.replace("-0", ""))} B.C.`;
  if (s.startsWith("-00")) s = `${parseInt(s.replace("-00", ""))} B.C.`;
  if (s.startsWith("-000")) s = `${s.replace("-000", "")} B.C.`;
  //
  return s;
};
const renderClaim = (type: string, property: any, value: string) =>
  type === "url" ? (
    toExternalUrl(value, property.name)
  ) : property.name === "Commons category" ? (
    renderLink(toWikiCategoryEntryUrl(value), property.name, value)
  ) : property.name === "Commons gallery" ? (
    renderLink(toWikiEntryUrl(value), property.name, value)
  ) : (
    <label>{type === "time" ? shortenTime(value) : value}</label>
  );

const WikiClaimItem = (props: WikiClaimIconProps) => {
  const { property, claimEnvelope } = props;
  const { type, val, value, l } = claimEnvelope;
  //
  const claim = useMemo(
    () => renderClaim(type, property, value),
    [type, property, value]
  );
  //
  return (
    <WikiClaimItemContainer>
      <WikiClaimItemCaption>
        {property.name}
        <small>{l > 1 ? ` [+${l - 1}]` : ""}</small>
      </WikiClaimItemCaption>
      <WikiClaimItemContent>{claim}</WikiClaimItemContent>
    </WikiClaimItemContainer>
  );
};

export default WikiClaimItem;
