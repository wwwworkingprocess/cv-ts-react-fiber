import { useMemo, useState } from "react";

import { toWikiCategoryEntryUrl, toWikiEntryUrl } from "../../../utils/wiki";
import useWikiChartData from "../../../hooks/wiki/useWikiChartData";

import Dialog from "../../../components/dialog/dialog.component";
import PopulationDevelopmentChart from "../../charts/population-development-chart/population-development-chart.component";
import LifeExpectancyChart from "../../charts/life-expectancy-chart/life-expectancy-chart.component";
import DemocracyIndexChart from "../../charts/democracy-index-chart/democracy-index-chart.component";

import {
  WikiClaimItemCaption,
  WikiClaimItemContainer,
  WikiClaimItemContent,
} from "./wiki-claim-item.styles";

type WikiClaimIconProps = {
  property: any;
  claimEnvelope: {
    type: string;
    val: any;
    value: string;
    l: number;
    raw: any;
  };
};

const toExternalUrl = (url: string, title: string) => {
  let s = url;
  //
  if (s.startsWith("http://")) s = s.replace("http://", "");
  if (s.startsWith("https://")) s = s.replace("https://", "");
  if (s.startsWith("www.")) s = s.replace("www.", "");
  if (s.endsWith("/")) s = s.substring(0, s.length - 1);
  //
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
    <label style={{ textDecoration: "none" }}>
      {type === "time" ? shortenTime(value) : value}
    </label>
  );

const MoreButton = (props: { property: any; l: number; onClick: any }) => {
  const { property, l, onClick } = props;
  //
  if (l <= 1) return null;
  //
  const isMoreButtonActive = ["P1082", "P2250", "P8328"].includes(
    property.code
  );
  //
  return isMoreButtonActive ? (
    <span style={{ color: "gold", cursor: "pointer" }} onClick={onClick}>
      (+{l - 1})
    </span>
  ) : (
    <small>[+{l - 1}]</small>
  );
};

const WikiClaimItem = (props: WikiClaimIconProps) => {
  const { property, claimEnvelope } = props;
  const { type, val, value, l, raw } = claimEnvelope;
  //
  const claim = useMemo(
    () => renderClaim(type, property, value),
    [type, property, value]
  );
  //
  const [open, setOpen] = useState<boolean>(false);
  //
  const skip = !open;
  const data = useWikiChartData(property, raw, skip);
  //
  const onMoreClick = () => setOpen(true);
  //
  const currentChart = useMemo(
    () =>
      data.length === 0 ? null : property.code === "P1082" ? (
        <PopulationDevelopmentChart data={data} />
      ) : property.code === "P2250" ? (
        <LifeExpectancyChart data={data} />
      ) : property.code === "P8328" ? (
        <DemocracyIndexChart data={data} />
      ) : null,
    [property, data]
  );
  //
  // console.log("chart data", data);
  //
  return (
    <>
      <WikiClaimItemContainer>
        <WikiClaimItemCaption>
          {property.name}

          <MoreButton property={property} l={l} onClick={onMoreClick} />
        </WikiClaimItemCaption>
        <WikiClaimItemContent>{claim}</WikiClaimItemContent>
      </WikiClaimItemContainer>
      {open ? (
        <Dialog isOpen={open} onClose={() => setOpen(false)} width={800}>
          <div style={{ margin: "10px", marginBottom: "0px" }}>
            {currentChart}
          </div>
        </Dialog>
      ) : null}
    </>
  );
};

export default WikiClaimItem;
