import { useMemo } from "react";
import useGameAppStore from "../../../fiber-apps/demography-game/stores/useGameAppStore";

import useWikiLabels from "../../../hooks/wiki/useWikiLabels";
import { TypeMemo } from "../../../routes/map/useMapMemos";

import TreeHelper from "../../../utils/tree-helper";
// import { } from "./features-summary.styles";

type FeaturesSummaryProps = {
  countryCode: string;
  //
  tree: TreeHelper | undefined;
  typeTree: TreeHelper | undefined;
  //
  typeMemo: TypeMemo;
};

const FeaturesSummary = (props: FeaturesSummaryProps) => {
  const { countryCode, tree, typeTree, typeMemo } = props;
  //
  const setSelectedCode = useGameAppStore((s) => s.setSelectedCode);

  const sortedEntries = useMemo(
    () =>
      (tree
        ? Object.entries(tree.list_by_type()).sort(
            ([atype, ainstances]: any, [btype, binstances]: any) =>
              binstances.length - ainstances.length
          )
        : []) as Array<[string, Array<number>]>,
    [tree]
  );

  const topFeatures = useMemo(
    () => sortedEntries.slice(0, 10),
    [sortedEntries]
  );

  const topFeatureIds = useMemo(
    () => topFeatures.map(([type, instances]) => `Q${type}`),
    [topFeatures]
  );
  //
  const { loading, labels } = useWikiLabels(topFeatureIds);
  //
  const topFeaturesWithLabels = useMemo(() => {
    return !loading && labels
      ? topFeatures.map((tf) => [tf[0], tf[1], labels[`Q${tf[0]}`]])
      : [];
  }, [loading, topFeatures, labels]);

  /*
  const singleFeatures = useMemo(
    () =>
      sortedEntries
        .filter(([type, instances]) => instances.length === 1)
        .slice(0, 10),
    [sortedEntries]
  );

  const commonFeatures = useMemo(() => {
    //
    // all - (top + single)
    //
    const isCommonFeature = (
      [type, instances]: [string, Array<number>],
      idx: number
    ) => idx > 10 && instances.length !== 1;
    //
    const comomns = sortedEntries.filter(isCommonFeature);

    return comomns;
  }, [sortedEntries]);
  */

  const treeValuesByType = useMemo(
    () => (tree ? tree.list_by_type() : undefined),
    [tree]
  );

  const treeValuesByTypeTops = useMemo(
    () =>
      treeValuesByType
        ? Object.fromEntries(
            Object.entries(treeValuesByType).map(([code, instances]) => [
              code,
              instances.slice(0, 5),
            ])
          )
        : undefined,
    [treeValuesByType]
  );

  const renderFeatureRow = (
    [code, parents, label]: Array<any>,
    idx: number
  ) => {
    if (!tree) return null;
    //
    const size = code === 6256 ? 1 : tree.typeSize(code);
    const preview =
      code === 6256
        ? [tree._find(parseInt(countryCode.replace("Q", "")))]
        : treeValuesByTypeTops // && size < 6
        ? treeValuesByTypeTops[code]
        : [];
    //
    // console.log("preview", size, preview);
    //
    return (
      <>
        {label} <small>({size})</small>
        <span style={{ float: "right" }}>
          {preview.map((p, idx) =>
            p ? (
              <button
                key={idx}
                style={{ fontSize: "12px", float: "left" }}
                onClick={(e) => {
                  setSelectedCode(`Q${p.code}`);
                }}
              >
                {p.name ?? p.code}
              </button>
            ) : null
          )}
        </span>
        <div style={{ clear: "both" }}></div>
      </>
    );
  };

  //
  // resolve labels of unknowns here (again)
  //
  const idsMissingLabels = useMemo(
    () => (typeMemo ? typeMemo.unknown.map(({ t }) => `Q${t}`) : []),
    [typeMemo]
  );

  //   console.log("jsx", idsMissingLabels);

  const { loading: missingLabelLoading, labels: missingLabels } =
    useWikiLabels(idsMissingLabels);
  // //
  const jsxUnidentifiedFeatures = useMemo(() => {
    if (missingLabelLoading) return "Loading...";
    if (!missingLabels) return null;
    if (!typeMemo) return null;
    //
    console.log("jsx", idsMissingLabels);
    //
    const renderUnidenfiedFeatureRow = (
      [code, parents, label]: Array<any>,
      idx: number
    ) => {
      if (!tree) return null;
      //
      const size = code === 6256 ? 1 : tree.typeSize(code);
      const preview =
        code === 6256
          ? [tree._find(parseInt(countryCode.replace("Q", "")))]
          : treeValuesByTypeTops // && size < 6
          ? treeValuesByTypeTops[code]
          : [];
      //
      // console.log("preview", size, preview);
      //
      return (
        <div key={idx}>
          {label} <small>({size})</small>
          <span style={{ float: "right" }}>
            {preview.map((p, pidx) =>
              p ? (
                <button
                  key={pidx}
                  style={{ fontSize: "12px", float: "left" }}
                  onClick={(e) => {
                    setSelectedCode(`Q${p.code}`);
                  }}
                >
                  {p.name ?? p.code}
                </button>
              ) : null
            )}
          </span>
          <div style={{ clear: "both" }}></div>
        </div>
      );
    };

    //
    return typeMemo.unknown.length ? (
      <div
        style={{
          position: "relative",
          top: "-60px",
          maxHeight: "400px",
          overflow: "hidden",
        }}
      >
        <h4>Unidentified Features ({typeMemo.unknown.length})</h4>
        <div
          style={{
            maxHeight: "320px",
            overflowX: "hidden",
            overflowY: "scroll",
          }}
        >
          {typeMemo.unknown
            .map(({ t, label, count, pns }: any) => [
              t,
              [3],
              missingLabels[`Q${t}`],
            ])
            .map(renderUnidenfiedFeatureRow)}
        </div>
      </div>
    ) : null;
  }, [
    countryCode,
    idsMissingLabels,
    missingLabelLoading,
    missingLabels,
    typeMemo,
    tree,
    treeValuesByTypeTops, // ???
    setSelectedCode,
  ]);

  return (
    <>
      {/* Features by occurance */}
      <>
        <h4>Top 10 Features in Country</h4>
        <div style={{ float: "left", width: "40vw" }}>
          {topFeaturesWithLabels.map(([type, instances, label], idx) => (
            <div key={idx}>
              {idx + 1} - {type} - {label} - {instances.length} feature
            </div>
          ))}
        </div>
        <div style={{ float: "right", width: "40vw" }}>
          {jsxUnidentifiedFeatures}
        </div>
        <div style={{ clear: "both" }}></div>
      </>

      {/* Features by type groups */}
      {tree && typeTree && typeMemo ? (
        <>
          {/* {jsxUnidentifiedFeatures} */}
          {missingLabelLoading ? "Loading..." : ""}
          {/* {idsMissingLabels.join(" - ")} */}
          <h4>Identified Features ({typeMemo.coverage})</h4>
          {typeMemo.reducedMemo.countries.length ? (
            <>
              <h4>
                Country Features ({typeMemo.reducedMemo.countries.length})
              </h4>
              <div>
                {typeMemo.reducedMemo.countries.map((type, idx) => (
                  <div key={idx}>{renderFeatureRow(type, idx)}</div>
                ))}
              </div>
            </>
          ) : null}
          <hr />
          {typeMemo.reducedMemo.admins.length ? (
            <>
              <h4>Admin Features ({typeMemo.reducedMemo.admins.length})</h4>
              <div>
                {typeMemo.reducedMemo.admins.map((type, idx) => (
                  <div key={idx}>{renderFeatureRow(type, idx)}</div>
                ))}
              </div>
            </>
          ) : null}
          <hr />
          {typeMemo.reducedMemo.settlements.length ? (
            <>
              <h4>
                Settlement Features ({typeMemo.reducedMemo.settlements.length})
              </h4>
              <div>
                {typeMemo.reducedMemo.settlements.map((type, idx) => (
                  <div key={idx}>{renderFeatureRow(type, idx)}</div>
                ))}
              </div>
            </>
          ) : null}
          <hr />
          {typeMemo.reducedMemo.rests.length ? (
            <>
              <h4>Other Features ({typeMemo.reducedMemo.rests.length})</h4>
              <div>
                {typeMemo.reducedMemo.rests.map((type, idx) => (
                  <div key={idx}>{renderFeatureRow(type, idx)}</div>
                ))}
              </div>
            </>
          ) : null}
          <hr />
        </>
      ) : null}

      {/* Features by occurance */}
      {/* 
      <>
        <h4>Single Features</h4>
        {singleFeatures.map(([type, instances], idx) => (
          <div key={idx}>
            {idx + 1} - {type} - {instances.length} feature
          </div>
        ))}
      </>
      <>
        <h4>Common Features</h4>
        {commonFeatures.map(([type, instances], idx) => (
          <div key={idx}>
            {idx + 1} - {type} - {instances.length} feature
          </div>
        ))}
      </>
       */}
    </>
  );
};

export default FeaturesSummary;
