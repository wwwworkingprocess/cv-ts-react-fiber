import { useEffect, useMemo, useState } from "react";

import useGameAppStore from "../../../fiber-apps/demography-game/stores/useGameAppStore";

import {
  toExternalSourceUrl,
  hasFormatterUrl,
  toWikiCommonsMediaUrl,
  toWikiEntryUrl,
} from "../../../utils/wiki";

import { useWikiEntryReader } from "../../../hooks/wiki/useWikiEntryReader";

import Dialog from "../../dialog/dialog.component";

import {
  ClaimItem,
  ClaimItemDialogImage,
  ClaimItemDialogImageWrap,
  ClaimItemDialogOptionsPanel,
  ClaimItemMedia,
  ClaimItemMediaDialogFrame,
  ClaimItemMediaMoreImages,
  FlexContainer,
  FlexMediaContainer,
} from "./grouped-claims.styles";

type GroupedClaimsProps = { wikiEntry: any };

export type Claim = {
  // ...
  l: number;
  type: string;
  val: any;
  value: any;
  code: string;
  raw: any;
  //
  property: {
    code: string;
    name: string;
  };
};
//
//
//
const GroupedClaims = (props: GroupedClaimsProps) => {
  const { wikiEntry } = props;
  //
  const setLastTakenPlaceImageUrl = useGameAppStore(
    (s) => s.setLastTakenPlaceImageUrl
  );
  const setLastTakenPlaceGeoJsonUrl = useGameAppStore(
    (s) => s.setLastTakenPlaceGeoJsonUrl
  );
  //
  const { name, labels, claimsMeta } = useWikiEntryReader(wikiEntry);
  //
  const [imageFitWidth, setImageFitWidth] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [dialogUrl, setDialogUrl] = useState<string>();
  const [dialogExtraUrls, setDialogExtraUrls] = useState<Array<string>>([]);
  const [dialogWidth, setDialogWidth] = useState<number>(500);

  //
  //
  //
  const groupedClaims = useMemo(() => {
    if (claimsMeta && claimsMeta.values) {
      const [t1, t2, t3] = ["wikibase-item", "external-id", "commonsMedia"];
      const arr = claimsMeta.values;
      //
      const wiki = arr.filter((v) => v.type === t1) ?? [];
      const external = arr.filter((v) => v.type === t2) ?? [];
      const media = arr.filter((v) => v.type === t3) ?? [];
      const rest =
        arr.filter((v) => v.type !== t1 && v.type !== t2 && v.type !== t3) ??
        [];
      //
      return { wiki, external, media, rest };
    }
    //
    return undefined;
  }, [claimsMeta]);

  //
  // URL to display 'Location Image' for selectedCode
  // using 'image' (P18) or fallback 'coat of arms' (P94)
  //
  useEffect(() => {
    let entry;
    let value;
    //
    if (groupedClaims) {
      const props = groupedClaims.media;
      //
      const image = props.filter((c) => c.code === "P18")[0];
      const coatOfArms = !image && props.filter((c) => c.code === "P94")[0];
      const locator =
        !image && !coatOfArms && props.filter((c) => c.code === "P242")[0];
      //
      entry = image ?? coatOfArms ?? locator;
      //
      if (entry) {
        value = entry.value;
        //
        const url = toWikiCommonsMediaUrl(value, 95);
        //
        setLastTakenPlaceImageUrl(url);
      } else setLastTakenPlaceImageUrl(undefined);
    } else setLastTakenPlaceImageUrl(undefined);
  }, [groupedClaims, groupedClaims?.media, setLastTakenPlaceImageUrl]);

  // "P3896" - geoshape
  //
  // URL to display 'shape' for selectedCode
  // using 'geoshape' (P3896) or fallback 'shape' (P1419)
  //
  useEffect(() => {
    let entry;
    let value;
    //
    if (groupedClaims) {
      const props = groupedClaims.rest;
      //
      const geoshape = props.filter((c) => c.code === "P3896")[0];
      const shape = !geoshape && props.filter((c) => c.code === "P1419")[0];
      //
      entry = geoshape ?? shape;
      //
      if (entry) {
        value = entry.value;
        //
        const toUrl = (s: string): string =>
          `https://commons.wikimedia.org/data/main/${s}`;
        //
        setLastTakenPlaceGeoJsonUrl(toUrl(value));
      } else setLastTakenPlaceGeoJsonUrl(undefined);
    } else setLastTakenPlaceGeoJsonUrl(undefined);

    //
  }, [groupedClaims, groupedClaims?.media, setLastTakenPlaceGeoJsonUrl]);

  //
  //
  //
  const onMediaItemClicked = (
    target: any,
    property: any,
    value: any,
    raw: any
  ) => {
    let extraUrls = [] as Array<string>;
    //
    if (raw.length > 1) {
      extraUrls = raw
        .map((c: any) => c.mainsnak?.datavalue.value ?? "")
        .filter((s: string) => s.length > 0)
        .map((s: string) => toWikiCommonsMediaUrl(s, 50)); // includes first
    }
    //
    const cropFitWidth = 0.8;
    const cropFitHeight = 0.95;
    const w = window.innerWidth;
    //
    const width = w * (imageFitWidth ? cropFitWidth : cropFitHeight);
    const url = toWikiCommonsMediaUrl(value, Math.floor(width));
    //
    setIsDialogOpen(true);
    setDialogWidth(Math.floor(width));
    setDialogUrl(url);
    setDialogExtraUrls(extraUrls);
  };
  //
  const onDialogImageClicked = () => {
    setIsDialogOpen(false);
    setDialogUrl(undefined);
  };
  //
  const onDialogMoreImageClicked = (url: string) => {
    setDialogUrl(url.replace(`width=50`, `width=${dialogWidth}`));
  };

  //
  //
  //
  const externalCodeClaims = useMemo(() => {
    if (groupedClaims) {
      const withoutFormatter = (c: Claim) => !hasFormatterUrl(c.property.code);
      const byValueAsc = (a: Claim, b: Claim) => a.value.localeCompare(b.value);

      return groupedClaims.external
        .filter(withoutFormatter)
        .sort(byValueAsc) as Array<Claim>;
    }

    return [];
  }, [groupedClaims]);
  //
  //
  //
  const externalReferenceClaims = useMemo(() => {
    if (groupedClaims) {
      const withFormatter = (c: Claim) => hasFormatterUrl(c.property.code);
      const byLabelAsc = (a: Claim, b: Claim) =>
        a.property.name.localeCompare(b.property.name);

      return groupedClaims.external
        .filter(withFormatter)
        .sort(byLabelAsc) as Array<Claim>;
    }

    return [];
  }, [groupedClaims]);
  //
  const hasExternalClaims = useMemo(
    () => externalCodeClaims.length || externalReferenceClaims.length,
    [externalCodeClaims, externalReferenceClaims]
  );

  //
  //
  //
  const wikiCategoryClaims = useMemo(() => {
    if (groupedClaims) {
      const isCategoryReference = (c: Claim) =>
        c.property.name.startsWith("category") ||
        c.property.name.endsWith("category");
      const byValueAsc = (a: Claim, b: Claim) => a.value.localeCompare(b.value);

      return groupedClaims.wiki
        .filter(isCategoryReference)
        .sort(byValueAsc) as Array<Claim>;
    }

    return [];
  }, [groupedClaims]);

  //
  //
  //
  const wikiEntryClaims = useMemo(() => {
    if (groupedClaims) {
      const isNonCategoryReference = (c: Claim) =>
        !c.property.name.startsWith("category") &&
        !c.property.name.endsWith("category");
      const byLabelAsc = (a: Claim, b: Claim) =>
        a.property.name.localeCompare(b.property.name);

      return groupedClaims.wiki
        .filter(isNonCategoryReference)
        .sort(byLabelAsc) as Array<Claim>;
    }

    return [];
  }, [groupedClaims]);
  //
  const hasWikiClaims = useMemo(
    () => wikiCategoryClaims.length || wikiEntryClaims.length,
    [wikiCategoryClaims, wikiEntryClaims]
  );
  //
  //
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
  //
  const toIconOrUnit = (propertyName: string) => {
    //
    // exact
    //

    if (propertyName === "motto text") return `✍`;
    if (propertyName === "hashtag") return `#`;
    if (propertyName === "inception") return `⌛`;
    if (propertyName === "social media followers") return `🧍`;
    if (propertyName === "number of households") return `🏠`;
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
  const toWikiMediaUrl = (s: string) =>
    `https://commons.wikimedia.org/wiki/${s}`;
  const toWikiMediaCategoryUrl = (s: string) =>
    `https://commons.wikimedia.org/wiki/Category:${s}`;
  //
  const toClaimIcon = (property: any): JSX.Element | null => {
    const image =
      property.name === "Commons category"
        ? "https://commons.wikimedia.org/static/images/project-logos/commonswiki.png"
        : "";
    const icon = toIconOrUnit(property.name);
    //

    return image || icon ? (
      <span
        style={{
          float: "left",
          fontSize: "22px",
          padding: "2px",
          paddingTop: "2px",
          minWidth: "36px",
          textAlign: "center",
        }}
      >
        {image ? (
          <img
            src={image}
            style={{ width: "32px", height: "32px" }}
            alt={property.name}
          />
        ) : (
          icon
        )}
      </span>
    ) : null;
  };
  //
  return (
    <div>
      {claimsMeta && claimsMeta.other.length ? (
        <>
          <div>
            <hr />
            Unidentified properties:{" "}
            {claimsMeta.other
              .map((p) => p.code)
              .sort((a, b) => a.length - b.length)
              .join(" - ")}
          </div>
        </>
      ) : null}

      {groupedClaims ? (
        <div>
          {/* <h3>Information about {name}</h3> */}
          <FlexContainer>
            {groupedClaims.rest.map(
              ({ type, val, value, property, l }, idx) => (
                <ClaimItem key={idx} height={40} minWidth={160} maxWidth={400}>
                  {toClaimIcon(property)}
                  <div style={{ textDecoration: "none" }}>
                    <div
                      style={{
                        height: "20px",
                        fontSize: "14px",
                      }}
                    >
                      {property.name}
                      <small>{l > 1 ? ` [+${l - 1}]` : ""}</small>
                    </div>
                    <div style={{ marginTop: "-3px", textDecoration: "none" }}>
                      {type === "url" ? (
                        toExternalUrl(value, property.name)
                      ) : property.name === "Commons category" ? (
                        <a
                          target="_blank"
                          rel="noreferrer"
                          title={`${property.name}`}
                          href={toWikiMediaCategoryUrl(value)}
                          style={{ color: "gold", fontSize: "12px" }}
                        >
                          {value}
                        </a>
                      ) : property.name === "Commons gallery" ? (
                        <a
                          target="_blank"
                          rel="noreferrer"
                          title={`${property.name}`}
                          href={toWikiMediaUrl(value)}
                          style={{ color: "gold", fontSize: "12px" }}
                        >
                          {value}
                        </a>
                      ) : (
                        <label
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          {value}
                        </label>
                      )}
                    </div>
                  </div>
                </ClaimItem>
              )
            )}
          </FlexContainer>

          {hasWikiClaims ? (
            <>
              <h3>Related Wiki Pages</h3>
              <FlexContainer>
                {labels &&
                  wikiEntryClaims.map(
                    ({ type, val, value, property, l }, idx) => (
                      <ClaimItem
                        key={idx}
                        height={32}
                        minWidth={150}
                        maxWidth={200}
                      >
                        <div style={{ fontSize: "10px" }}>
                          {property.name}
                          <small>{l > 1 ? ` [+${l - 1}]` : ""}</small>
                        </div>
                        <a
                          target="_blank"
                          rel="noreferrer"
                          title={`${property.name}`}
                          href={toWikiEntryUrl(value)}
                          style={{ color: "gold", fontSize: "12px" }}
                        >
                          {labels[value] || value}
                        </a>
                      </ClaimItem>
                    )
                  )}
                {labels &&
                  wikiCategoryClaims.map(
                    ({ type, val, value, property, l }, idx) => (
                      <ClaimItem
                        key={idx}
                        height={32}
                        minWidth={100}
                        maxWidth={200}
                      >
                        <div style={{ fontSize: "10px" }}>
                          {property.name}
                          <small>{l > 1 ? ` [+${l - 1}]` : ""}</small>
                        </div>
                        <a
                          target="_blank"
                          rel="noreferrer"
                          title={`${property.name}`}
                          href={toWikiEntryUrl(value)}
                          style={{ color: "gold", fontSize: "12px" }}
                        >
                          {(labels[value] || value).replace("Category:", "")}
                        </a>
                      </ClaimItem>
                    )
                  )}
              </FlexContainer>
            </>
          ) : null}

          {groupedClaims.media.length ? (
            <>
              <h3>Images of {name}</h3>
              <FlexMediaContainer>
                {groupedClaims.media.map(
                  ({ type, val, value, property, l, raw }, idx) => (
                    <ClaimItemMedia
                      key={idx}
                      onClick={(e) =>
                        onMediaItemClicked(e.target, property, value, raw)
                      }
                    >
                      <img
                        src={toWikiCommonsMediaUrl(value, 200)}
                        alt={property.name}
                      />
                      <b>
                        {property.name}
                        <small>{l > 1 ? ` [+${l - 1}]` : ""}</small>
                      </b>
                    </ClaimItemMedia>
                  )
                )}
              </FlexMediaContainer>
              <Dialog
                isOpen={isDialogOpen}
                width={!imageFitWidth ? dialogWidth : window.innerWidth * 0.9}
                onClose={(e: CloseEvent) => {
                  setIsDialogOpen(false);
                  setDialogUrl(undefined);
                }}
              >
                <ClaimItemMediaDialogFrame imageFitWidth={imageFitWidth}>
                  <ClaimItemDialogOptionsPanel>
                    <button onClick={() => setImageFitWidth((b) => !b)}>
                      Fit: {imageFitWidth ? "Width" : "Height"}
                    </button>
                  </ClaimItemDialogOptionsPanel>
                  <ClaimItemDialogImageWrap>
                    <ClaimItemDialogImage
                      width={imageFitWidth ? "100%" : "auto"}
                      height={imageFitWidth ? "auto" : "90vh"}
                      src={dialogUrl}
                      alt=""
                      onClick={onDialogImageClicked}
                    />
                  </ClaimItemDialogImageWrap>
                  {dialogExtraUrls ? (
                    <ClaimItemMediaMoreImages>
                      {dialogExtraUrls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt=""
                          onClick={() => onDialogMoreImageClicked(url)}
                        />
                      ))}
                    </ClaimItemMediaMoreImages>
                  ) : null}
                </ClaimItemMediaDialogFrame>
              </Dialog>
            </>
          ) : null}

          {hasExternalClaims ? (
            <>
              <h3>External Sources</h3>
              <FlexContainer>
                {externalCodeClaims.map(
                  ({ type, val, value, property }, idx) => (
                    <ClaimItem
                      key={idx}
                      height={16}
                      minWidth={100}
                      maxWidth={200}
                    >
                      <div style={{ fontSize: "11px", height: "14px" }}>
                        <label>
                          {value} ({property.name})
                        </label>
                      </div>
                    </ClaimItem>
                  )
                )}
                {externalReferenceClaims.map(
                  ({ type, val, value, property }, idx) => (
                    <ClaimItem
                      key={idx}
                      height={16}
                      minWidth={100}
                      maxWidth={200}
                    >
                      <div style={{ fontSize: "11px", height: "14px" }}>
                        {hasFormatterUrl(property.code) ? (
                          <a
                            target="_blank"
                            rel="noreferrer"
                            title={`${property.name} # ${value}`}
                            href={toExternalSourceUrl(property.code, value)}
                            style={{ color: "gold" }}
                          >
                            {property.name}
                          </a>
                        ) : (
                          <label>
                            {value} ({property.name})
                          </label>
                        )}
                      </div>
                    </ClaimItem>
                  )
                )}
              </FlexContainer>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default GroupedClaims;
