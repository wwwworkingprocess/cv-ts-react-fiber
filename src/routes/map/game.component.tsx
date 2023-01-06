import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import ActionTabs from "../../components/demography/action-tabs/action-tabs.component";
import AdminOneList from "../../components/demography/admin-one-list/admin-one-list.component";
import AdminTwoList from "../../components/demography/admin-two-list/admin-two-list.component";
import NearbyTreeItems from "../../components/demography/nearby-tree-items/nearby-tree-items.component";
// import NearbyMultiplyTreeItems from "../../components/demography/nearby-multiple-tree-items/nearby-multiple-tree-items.component";
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

import { HalfContentBlock, BrowseSettlementContainer } from "./map.styles";
import FeaturesSummary from "../../components/demography/features-summary/features-summary.component";
import FeaturesOverview from "../../components/demography/features-overview/features-overview.component";
import useWindowSize from "../../hooks/useWindowSize";

import useTypeMemo from "../../fiber-apps/demography-game/hooks/useTypeMemo";
import ActionTabMainInfo from "../../components/demography/action-tabs/main-info/main-info.component";
import Button, {
  BUTTON_TYPE_CLASSES,
} from "../../components/button/button.component";
import { isAvailableCountryCode } from "../../config/country/available-countries";

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
  const tabs = ["Main Info", "Browse", "Features", "Nearby"]; // + "Search",
  const [tabsIndex, setTabsIndex] = useState<number>(0);
  //
  const [isDetailsVisible, setIsDetailsVisible] = useState<boolean>(false);
  const [countryCode] = useState<string | undefined>(selectedCountry?.code);
  const [selectedTypeId, setSelectedTypeId] = useState<number | undefined>();
  //
  const [topResultsLength, setTopResultsLength] = useState<number>(16);
  const [topTypeResultsLength, setTopTypeResultsLength] = useState<number>(16);

  //
  // MODULE LEVEL STATE
  //
  const [canvasHeightRatio, setCanvasHeightRatio] = useGameAppStore((s) => [
    s.canvasHeightRatio,
    s.setCanvasHeightRatio,
  ]);

  const setZoom = useGameAppStore((state) => state.setZoom);
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
    loadStep,
    loadCount,
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

  //console.log("mapmemo", adminOneMemo, adminTwoMemo);
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
  // Updating (settlement) selection, when valid route params where provided
  //
  useEffect(() => {
    if (tree) {
      if (selectedRouteCode) {
        const validCode = tree._n(selectedRouteCode) !== undefined;
        //
        setSelectedCode(validCode ? selectedRouteCode : undefined);
        if (validCode) setMoving(true, selectedRouteCode);
        //
        setIsDetailsVisible(true); // always show details when opened via permalink
      } else {
        //
        // only country is provided, when countrycode is valid, updating selection
        //
        /*
        if (isAvailableCountryCode(countryCode ?? "")) {
          if (selectedCode === undefined) {
            setSelectedCode(countryCode);
          } else {
            //
            // auto reset selection to current country, when previous selection
            // - was from another country
            // - or is a country, but not the current one
            //
            const type_country = 6256;
            const code = tree._qq(selectedCode);
            const isValidCode = code !== -1;
            const isValidNode = isValidCode && tree._find(code);
            const isCountry =
              isValidNode && tree._find(code)?.type === type_country;
            const isAnotherCountry =
              isValidCode && isCountry && selectedCode !== countryCode;
            //
            if (!isValidNode || !isAnotherCountry) setSelectedCode(countryCode);
          }
        }
        */
      }
    }
  }, [selectedRouteCode, tree, countryCode, setSelectedCode, setMoving]);
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
  const permalink = useMemo(
    () =>
      !selectedCountry
        ? `${path}map`
        : !selectedCode
        ? `${path}map/${selectedCountry.code}/${selectedCountry.code}`
        : `${path}map/${selectedCountry.code}/${selectedCode}`,
    [selectedCountry, selectedCode, path]
  );

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
        ? tree._n(tree._qc(selectedParent.p ?? 0))
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
  const scrollToDetails = useCallback(() => {
    setIsDetailsVisible(true);
    //
    // itemDetailsRef.current.scrollIntoView({
    //   behavior: "smooth",
    //   block: "start",
    // });
  }, []);

  useEffect(() => {
    let t: NodeJS.Timeout;
    //
    if (isDetailsVisible) {
      t = setTimeout(
        () =>
          itemDetailsRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        100
      );
    }
    //
    return () => {
      if (t) clearTimeout(t);
    };
  }, [isDetailsVisible]);

  //
  const { windowSize } = useWindowSize();
  const [canvasHeight, setCanvasHeight] = useState<number>(350);
  useEffect(() => {
    if (windowSize) setCanvasHeight(windowSize.height * canvasHeightRatio);
  }, [windowSize, canvasHeightRatio]);

  const gameInCountry = useMemo(() => {
    if (!selectedCountry) return null;
    if (!tree) return null;
    if (!typeTree) return null;
    if (!isTreeReady) return null;
    //
    return (
      <DemographyGame3D
        path={path}
        tree={tree}
        typeTree={typeTree}
        selectedCountry={selectedCountry}
        selectedTypeId={selectedTypeId}
        canvasHeight={canvasHeight}
        scrollToDetails={scrollToDetails}
      />
    );
  }, [
    path,
    selectedCountry,
    selectedTypeId,
    tree,
    typeTree,
    isTreeReady,
    canvasHeight,
    scrollToDetails,
  ]);

  //
  // Type related hooks below
  //
  const fgRef = useRef(); // features graph forward href

  // const { windowSize } = useWindowSize();
  const [graphWidth, setGraphWidth] = useState(400);
  //
  useEffect(() => {
    if (windowSize) setGraphWidth(windowSize.width * 0.9);
  }, [windowSize]);

  //

  const onZoomReset = () => {
    setSelectedCode(undefined);
  };
  const onTypeReset = () => setSelectedTypeId(undefined);
  const onTypeEnabled = useCallback(() => {
    if (allTypesWithPath && !selectedTypeId) {
      const first = allTypesWithPath[0];
      //
      if (first) setSelectedTypeId(first.code);
    }
  }, [allTypesWithPath, selectedTypeId]);
  const onCountryReset = () => gotoGameLandingPage();
  //
  const onChangeTopOptions = (e: ChangeEvent<HTMLSelectElement>) => {
    setTopResultsLength(parseInt(e.target.value));
  };
  const onChangeTopTypeOptions = (e: ChangeEvent<HTMLSelectElement>) => {
    setTopTypeResultsLength(parseInt(e.target.value));
  };
  const onChangeType = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedTypeId(parseInt(e.target.value));
  };
  //
  const onPopulatedPlaceClicked = () => console.log("Populated Place Clicked");
  const onFeatureOfTypeClicked = () => console.log("Feature of a Type Clicked");
  const onGotoSearchButtonClicked = () => setTabsIndex(4);
  const onNavigateToMainPage = () => navigate("/");
  //
  const mainInfoEventHandlers = {
    onZoomReset,
    onTypeEnabled,
    onTypeReset,
    onCountryReset,
    onNavigateToMainPage,
    onGotoSearchButtonClicked,
    onChangeTopOptions,
    onChangeTopTypeOptions,
    onChangeType,
    onPopulatedPlaceClicked,
    onFeatureOfTypeClicked,
  };
  //
  return (
    <>
      <ActionTabs
        tabs={tabs}
        tabsIndex={tabsIndex}
        setTabsIndex={setTabsIndex}
        selectedCode={selectedCode}
      />

      {/* COUNTRY DETAILS */}
      {tabsIndex === 0 ? (
        <ActionTabMainInfo
          selectedCountry={selectedCountry}
          selectedTypeId={selectedTypeId}
          selectedCode={selectedCode}
          //
          isTreeReady={isTreeReady}
          loadCount={loadCount}
          permalink={permalink}
          //
          topResultsLength={topResultsLength}
          topTypeResultsLength={topTypeResultsLength}
          //
          allTypesWithPath={allTypesWithPath}
          //
          topTenCities={topTenCities}
          topTypeCities={topTypeCities}
          //
          {...mainInfoEventHandlers}
        />
      ) : null}

      {/* ADMINISTRATIVE ZONES */}
      {tabsIndex === 1
        ? selectedCountry && (
            <>
              <h3>Settlements of {selectedCountry.name}</h3>
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
          )
        : null}

      {/* FEATURES SUMMARY */}
      {tabsIndex === 2 && tree && typeTree && typeMemo ? (
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
              setTabsIndex={setTabsIndex}
            />
          ) : null}
        </div>
      ) : null}

      {/* NEARBY ITEMS */}
      {tabsIndex === 3 && tree && selectedCountry && selectedCode ? (
        <div style={{ width: "100%" }}>
          <h3>
            Nearby {tree._n(selectedCode)?.name} in {selectedCountry.name}
          </h3>

          <NearbyTreeItems
            tree={tree}
            selectedCode={selectedCode}
            setSelectedCode={setSelectedCode}
          />
        </div>
      ) : null}

      {/* SETTLEMENT SEARCH */}
      {tabsIndex === 4 && countryCode ? (
        <>
          <h3>Search for a Settlement</h3>
          <SettlementSearch tree={tree} countryCode={countryCode} />
        </>
      ) : null}

      {/* MAP-OR-GRAPH AND BREAD CRUMB */}
      {!selectedCountry ? null : !tree || !isTreeReady ? (
        <>
          {loadStep === 0
            ? "Downloading data..."
            : loadStep === 1
            ? `Preparing ${loadCount} features...`
            : loadStep === 2
            ? `Preparing ${loadCount} labels...`
            : loadStep === 3
            ? `Preparing ${loadCount} feature details...`
            : loadStep === 4
            ? `Preparing content, ${loadCount} features...`
            : loadStep === 5
            ? "Preparing feature layers."
            : "Something went wrong, please reload the page."}
          <Spinner />
        </>
      ) : (
        <div>
          {tabsIndex === 2 ? (
            typeGraphData ? (
              <>
                <FeaturesOverview
                  fgRef={fgRef}
                  data={typeGraphData}
                  graphWidth={graphWidth}
                  setSelectedTypeId={setSelectedTypeId}
                />
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
          {selectedCode ? (
            <Button
              buttonType={
                isDetailsVisible
                  ? BUTTON_TYPE_CLASSES.base
                  : BUTTON_TYPE_CLASSES.inverted
              }
              style={{
                float: "right",
              }}
              onClick={() => {
                setIsDetailsVisible(!isDetailsVisible);
              }}
            >
              {!isDetailsVisible ? "Show Details" : "Hide Details"}
            </Button>
          ) : null}
          {selectedCode && !isDetailsVisible ? (
            <div style={{ height: "50px", paddingTop: "20px" }}>
              Click show details, to learn more about the location.
            </div>
          ) : null}
        </div>
      )}

      {/* SELECTION DETAILS */}
      <div
        ref={itemDetailsRef}
        style={{
          display: isDetailsVisible ? "block" : "none",
          marginTop: "10px",
        }}
      >
        <WikiItemDetails
          selectedCode={selectedCode}
          isVisible={isDetailsVisible}
        />
      </div>
    </>
  );
};

export default WikiDemographyGame;
