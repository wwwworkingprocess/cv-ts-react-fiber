import { useMemo } from "react";

import { useWikiEntryReader } from "../../../hooks/wiki/useWikiEntryReader";

import externalMap from "../../../assets/json/wiki/properties.formatterurls.json";

import {
  ClaimItem,
  ClaimItemMedia,
  FlexContainer,
  FlexMediaContainer,
} from "./grouped-claims.styles";

type GroupedClaimsProps = { wikiEntry: any };

const formatterUrls = externalMap as Record<string, any>;
const toMediaUrl = (mediaName: string, width?: number): string =>
  `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${mediaName}&width=${
    width ?? 300
  }`;

const GroupedClaims = (props: GroupedClaimsProps) => {
  const { wikiEntry } = props;
  //
  const { name, labels, claimsMeta } = useWikiEntryReader(wikiEntry);
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
  // console.log("claimsMeta", claimsMeta, "labels", labels);
  //
  const buildUrl = (propertyCode: string, value: string) => {
    const idPlaceholder = "###ID###";
    const formatterUrl = (formatterUrls[propertyCode] ?? "") as string;
    //
    return formatterUrl.includes(idPlaceholder)
      ? formatterUrl.replace(idPlaceholder, value)
      : `${formatterUrl}${value}`;
  };
  //
  return (
    <div>
      {groupedClaims ? (
        <div>
          <h3>Information about {name}</h3>
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

          {groupedClaims.wiki.length && (
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
          )}

          {groupedClaims.media.length && (
            <>
              <h3>Images of {name}</h3>
              <FlexMediaContainer>
                {groupedClaims.media.map(
                  ({ type, val, value, property, l }, idx) => (
                    <ClaimItemMedia key={idx}>
                      <img src={toMediaUrl(value, 200)} alt={property.name} />
                      <b>
                        {property.name}
                        <small>{l > 1 ? ` [+${l - 1}]` : ""}</small>
                      </b>
                    </ClaimItemMedia>
                  )
                )}
              </FlexMediaContainer>
            </>
          )}

          {groupedClaims.external.length && (
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
                        {formatterUrls[property.code] ? (
                          <a
                            target="_blank"
                            rel="noreferrer"
                            title={`${property.name} # ${value}`}
                            href={buildUrl(property.code, value)}
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
          )}
        </div>
      ) : null}
      {claimsMeta && claimsMeta.other.length ? (
        <>
          <div>
            <hr />
            Unidentified properties:{" "}
            {claimsMeta.other.map((p) => p.code).join(" - ")}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default GroupedClaims;
