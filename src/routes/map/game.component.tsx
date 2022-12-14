import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import ActionTabs from "../../components/demography/action-tabs/action-tabs.component";
import AdminOneList from "../../components/demography/admin-one-list/admin-one-list.component";
import AdminTwoList from "../../components/demography/admin-two-list/admin-two-list.component";
import NearbyTreeItems from "../../components/demography/nearby-tree-items/nearby-tree-items.component";
import NearbyMultiplyTreeItems from "../../components/demography/nearby-multiple-tree-items/nearby-multiple-tree-items.component";
import SettlementSearch from "../../components/demography/settlement-search/settlement-search.component";
import TreeBreadCrumb from "../../components/demography/tree-bread-crumb/tree-bread-crumb.component";
import WikiItemDetails from "../../components/demography/wiki-item-details/wiki-item-details.component";
import CityList from "../../components/demography/city-list/city-list.component";
import { Spinner } from "../../components/spinner/spinner.component";

import DemographyGame3D from "../../fiber-apps/demography-game/demography-game-3d";
import useGameAppStore from "../../fiber-apps/demography-game/stores/useGameAppStore";
import useMapMemos from "../../fiber-apps/demography-game/hooks/useMapMemos";

//TODO: fix usage
import { useWikiCountries } from "../../fiber-apps/wiki-country/hooks/useWikiCountries";

import { IS_CLOUD_ENABLED } from "../../utils/firebase/provider";
import type { WikiCountry } from "../../utils/firebase/repo/wiki-country.types";

import {
  HalfContentBlock,
  BrowseSettlementContainer,
  NearbyItemsContainer,
} from "./map.styles";
import FeaturesSummary from "../../components/demography/features-summary/features-summary.component";
import FeaturesOverview from "../../components/demography/features-overview/features-overview.component";
import useWindowSize from "../../hooks/useWindowSize";

import useTypeMemo from "../../fiber-apps/demography-game/hooks/useTypeMemo";

//
// Routing params by
// 1. [country_code]
// 2. [country_code + selected_code]
//
const WikiDemographyGame = (props: {
  path: string;
  selectedCountry: WikiCountry | undefined;
  selectedRouteCode: string | undefined;
}) => {
  const { path, selectedCountry, selectedRouteCode } = props;
  //
  //
  //
  const { data: wikiCountries } = useWikiCountries(IS_CLOUD_ENABLED, path);
  //
  // COMPONENT LEVEL STATE
  //
  const tabs = ["Main Info", "Features", "Browse", "Nearby"]; // "Search",
  const [tabsIndex, setTabsIndex] = useState<number>(0);
  //
  const [countryCode] = useState<string | undefined>(selectedCountry?.code);
  const [selectedTypeId, setSelectedTypeId] = useState<number | undefined>();
  //
  const [topResultsLength, setTopResultsLength] = useState<number>(16);
  const [topTypeResultsLength, setTopTypeResultsLength] = useState<number>(16);

  //
  // MODULE LEVEL STATE
  //
  const setMoving = useGameAppStore((state) => state.setMoving);
  const [selectedCode, setSelectedCode] = useGameAppStore((s) => [
    s.selectedCode,
    s.setSelectedCode,
  ]);

  //
  // Retrieving country data and type information
  //
  // 1.(tree+typetree) - Country's features and a helper for types
  // 2.adminOneMemo - Country's most top level features list
  // 3.adminTwoMemo - Country's below top level features list
  // 4.topTenCities - Country's most populated settlements list
  //
  const {
    isTreeReady,
    //
    tree,
    typeTree,
    //
    adminOneMemo,
    adminTwoMemo,
    //
    topTenCities,
  } = useMapMemos(
    countryCode,
    wikiCountries,
    selectedCountry,
    selectedCode,
    topResultsLength,
    path
  );

  //
  // Type related memos created 'over' (tree+typetree)
  //
  // 1. allTypesWithPath - types having instances in tree (flat list)
  // 2. typeMemo - Grouping layers by type
  // 3. topTypeCities - Retrieving features of a specific type
  // 4. typeGraphData - Visualizing used types and their relation as a graph
  //
  const { allTypesWithPath, typeMemo, topTypeCities, typeGraphData } =
    useTypeMemo(tree, typeTree, selectedTypeId, topTypeResultsLength);

  //
  // enable or disable type based filtering
  //
  const resetTypeId = () => setSelectedTypeId(undefined);
  const enableTypeId = useCallback(() => {
    if (allTypesWithPath && !selectedTypeId) {
      const first = allTypesWithPath[0];
      //
      if (first) setSelectedTypeId(first.code);
    }
  }, [allTypesWithPath, selectedTypeId]);

  //
  //
  // Updating (settlement) selection, when valid route params where provided
  //
  useEffect(() => {
    if (selectedRouteCode && tree) {
      const validCode = tree._n(selectedRouteCode) !== undefined;
      //
      setSelectedCode(validCode ? selectedRouteCode : undefined);
      if (validCode) setMoving(true, selectedRouteCode);
    }
  }, [selectedRouteCode, tree, setSelectedCode, setMoving]);
  //
  //
  //

  const navigate = useNavigate();
  //
  const relativePath = useCallback(
    (endpoint: string) => `${path ? `${path}/` : ""}${endpoint}`,
    [path]
  );
  //
  const gotoGameLandingPage = useCallback(
    () => navigate(relativePath("map")),
    [navigate, relativePath]
  );
  //
  const onCountryReset = () => {
    gotoGameLandingPage();
  };

  //
  //
  //
  const backToParentMemo = useMemo(() => {
    if (!tree || !selectedCountry || !selectedCode) return null;
    //
    const isAminOneLevel = selectedCode === selectedCountry.code;
    //
    if (isAminOneLevel) return null;
    //
    // the button is visible, we need to know, [selectedNode]
    // is a leaf or not, to navigate correctly
    //
    const selectedNode = tree._n(selectedCode);
    //
    if (!selectedNode) return null;
    //
    const isLeaf = tree._is_leaf(selectedNode.code);
    //
    const selectedParent = selectedNode.p
      ? tree._n(tree._qc(selectedNode.p))
      : undefined;

    if (!selectedParent)
      console.warn("Invalid tree node, no parent for ", selectedNode);

    const selectedGrandParent =
      isLeaf && selectedParent
        ? tree._n(tree._qc(selectedParent.p))
        : undefined;
    //
    const activeParent = isLeaf ? selectedGrandParent : selectedParent;
    //
    const onBackToParentClicked = () => {
      if (tree && selectedCode && activeParent) {
        setSelectedCode(tree._qc(activeParent.code));
      }
    };
    //
    return (
      <>
        <button
          style={{ float: "right" }}
          onClick={() => onBackToParentClicked()}
        >
          Back
        </button>
        <div style={{ clear: "both" }} />
      </>
    );
  }, [tree, selectedCountry, selectedCode, setSelectedCode]);

  const itemDetailsRef = useRef<HTMLDivElement>(null!);
  const scrollToDetails = useCallback(
    () =>
      itemDetailsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      }),
    []
  );

  //
  const gameInCountry = useMemo(() => {
    if (!selectedCountry) return null;
    if (!tree) return null;
    if (!typeTree) return null;
    if (!isTreeReady) return null;
    //
    return (
      <DemographyGame3D
        tree={tree}
        typeTree={typeTree}
        selectedCountry={selectedCountry}
        selectedTypeId={selectedTypeId}
        scrollToDetails={scrollToDetails}
      />
    );
  }, [
    selectedCountry,
    selectedTypeId,
    tree,
    typeTree,
    isTreeReady,
    scrollToDetails,
  ]);

  //
  const topOptions = useMemo(() => {
    // topResultsLength
    const options = [5, 10, 16, 20, 50];
    //
    return (
      <select
        value={topResultsLength}
        onChange={(e) => {
          setTopResultsLength(parseInt(e.target.value));
        }}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    );
  }, [topResultsLength, setTopResultsLength]);

  //
  const typeTopOptions = useMemo(() => {
    // topResultsLength
    const options = [5, 10, 16, 20, 50, 100, 200];
    //
    return (
      <select
        value={topTypeResultsLength}
        onChange={(e) => {
          setTopTypeResultsLength(parseInt(e.target.value));
        }}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    );
  }, [topTypeResultsLength, setTopTypeResultsLength]);

  //
  // Type related hooks below
  //
  const fgRef = useRef(); // features graph forward href

  const { windowSize } = useWindowSize();
  const [graphWidth, setGraphWidth] = useState(400);
  //
  useEffect(() => {
    if (windowSize) setGraphWidth(windowSize.width * 0.9);
  }, [windowSize]);

  //
  //
  //
  return (
    <>
      <ActionTabs
        tabs={tabs}
        tabsIndex={tabsIndex}
        setTabsIndex={setTabsIndex}
        selectedCode={selectedCode}
      />

      {tabsIndex === 0 ? (
        <>
          {/* COUNTRY DETAILS */}
          {selectedCountry && (
            <>
              <h3>Country Details</h3>
              {!selectedCode ? (
                <p>
                  Please{" "}
                  <span
                    style={{ color: "gold" }}
                    onClick={(e) => setTabsIndex(1)}
                  >
                    search
                  </span>{" "}
                  for a settlement to continue
                  {selectedCountry ? (
                    <>
                      {" "}
                      or{" "}
                      <button onClick={onCountryReset}>
                        select another country
                      </button>
                      .
                    </>
                  ) : null}
                </p>
              ) : null}
            </>
          )}
          {tree && typeTree && isTreeReady ? (
            <div>
              {selectedTypeId !== undefined ? (
                <button onClick={resetTypeId}>Clear type filter</button>
              ) : (
                <button onClick={() => enableTypeId()}>
                  Enable type filter
                </button>
              )}
              {selectedTypeId === undefined ? (
                <>
                  <h4 style={{ marginBottom: "5px" }}>
                    Top {topOptions} Most Populated Places
                  </h4>
                  <CityList
                    cities={topTenCities}
                    onClicked={() => console.log("Populated Place Clicked")}
                  />
                </>
              ) : (
                <>
                  <h4 style={{ marginBottom: "5px" }}>
                    Top {typeTopOptions} Features matching type
                    <select
                      value={selectedTypeId}
                      onChange={(e) =>
                        setSelectedTypeId(parseInt(e.target.value))
                      }
                    >
                      {allTypesWithPath.map((t) => (
                        <option key={t.code} value={t.code}>
                          {`[${t.count}] ${
                            t.path.length > 50
                              ? `${t.path.substring(0, 47)}...`
                              : t.path
                          }`}
                        </option>
                      ))}
                    </select>
                  </h4>
                  <CityList
                    cities={topTypeCities}
                    onClicked={() => console.log("Feature of a Type Clicked")}
                  />
                </>
              )}
            </div>
          ) : null}
        </>
      ) : null}

      {tabsIndex === 1 ? (
        <>
          {/* FEATURES SUMMARY */}
          {tree && typeTree && typeMemo ? (
            <div style={{ width: "100%" }}>
              <h3>Feature summary</h3>
              {countryCode ? (
                <FeaturesSummary
                  tree={tree}
                  typeTree={typeTree}
                  typeMemo={typeMemo}
                  countryCode={countryCode}
                  selectedTypeId={selectedTypeId}
                  setSelectedTypeId={setSelectedTypeId}
                />
              ) : null}
            </div>
          ) : (
            ""
          )}
        </>
      ) : null}

      {tabsIndex === 2 ? (
        <>
          {/* ADMINISTRATIVE ZONES */}
          {selectedCountry && (
            <>
              <h3>Browse for a Settlement</h3>
              <BrowseSettlementContainer>
                <HalfContentBlock minWidth={"30%"}>
                  <b>Administrative Areas</b>
                  {adminOneMemo && selectedCountry ? (
                    <AdminOneList
                      items={adminOneMemo}
                      setSelectedCode={setSelectedCode}
                    />
                  ) : null}
                </HalfContentBlock>
                <HalfContentBlock minWidth={"30%"}>
                  <b>Located in Area</b> {backToParentMemo}
                  {selectedCode ? (
                    <AdminTwoList
                      items={adminTwoMemo}
                      setSelectedCode={setSelectedCode}
                    />
                  ) : null}
                </HalfContentBlock>
              </BrowseSettlementContainer>
            </>
          )}
        </>
      ) : null}

      {/* {tabsIndex === 3 ? (
        <>
          <h3>Search for a Settlement</h3>
          {countryCode ? (
            <SettlementSearch tree={tree} countryCode={countryCode} />
          ) : null}
        </>
      ) : null} */}

      {tabsIndex === 3 ? (
        <>
          {/* NEARBY ITEMS */}
          {tree && selectedCountry && selectedCode ? (
            <div style={{ width: "100%" }}>
              <h3>
                Nearby {tree._n(selectedCode)?.name} ({selectedCode})
              </h3>

              <NearbyTreeItems
                tree={tree}
                selectedCode={selectedCode}
                setSelectedCode={setSelectedCode}
              />
              <NearbyItemsContainer>
                {/* <HalfContentBlock minWidth={"300px"}>
                </HalfContentBlock> */}
                {/* <HalfContentBlock minWidth={"300px"}>
                  <NearbyMultiplyTreeItems
                    tree={tree}
                    selectedCode={selectedCode}
                  />
                </HalfContentBlock> */}
              </NearbyItemsContainer>
            </div>
          ) : (
            ""
          )}
        </>
      ) : null}

      {/* MAP AND BREAD CRUMB NAVIGATION */}
      {!selectedCountry ? null : !tree || !isTreeReady ? (
        <Spinner />
      ) : (
        <div>
          {tabsIndex === 1 ? (
            typeGraphData ? (
              <>
                <FeaturesOverview
                  fgRef={fgRef}
                  data={typeGraphData}
                  graphWidth={graphWidth}
                  setSelectedTypeId={setSelectedTypeId}
                />
                Type:{selectedTypeId}
              </>
            ) : null
          ) : (
            gameInCountry
          )}
          <TreeBreadCrumb
            tree={tree}
            selectedCode={selectedCode}
            setSelectedCode={setSelectedCode}
          />
        </div>
      )}

      {/* SELECTION DETAILS */}
      <div ref={itemDetailsRef}>
        <WikiItemDetails selectedCode={selectedCode} />
      </div>
    </>
  );
};

export default WikiDemographyGame;
