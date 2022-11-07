import { useEffect, useMemo, useState } from "react";

import useGameAppStore from "../../../fiber-apps/demography-game/stores/useGameAppStore";

import {
  toExternalSourceUrl,
  hasFormatterUrl,
  toWikiCommonsMediaUrl,
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
                <ClaimItem key={idx} height={40} minWidth={160} maxWidth={300}>
                  <div style={{ height: "20px", fontSize: "14px" }}>
                    {property.name}
                    <small>{l > 1 ? ` [+${l - 1}]` : ""}</small>
                  </div>
                  <label>{value}</label>
                </ClaimItem>
              )
            )}
          </FlexContainer>

          {groupedClaims.wiki.length ? (
            <>
              <h3>Related Wiki Pages</h3>
              <FlexContainer>
                {labels &&
                  groupedClaims.wiki.map(
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
                        <label style={{ fontSize: "12px" }}>
                          {labels[value] || value}
                        </label>
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

          {groupedClaims.external.length ? (
            <>
              <h3>External Sources</h3>
              <FlexContainer>
                {groupedClaims.external.map(
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
      {/* {claimsMeta && claimsMeta.other.length ? (
        <>
          <div>
            <hr />
            Unidentified properties:{" "}
            {claimsMeta.other.map((p) => p.code).join(" - ")}
          </div>
        </>
      ) : null} */}
    </div>
  );
};

export default GroupedClaims;
