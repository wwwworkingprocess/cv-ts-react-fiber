import { Fragment, useCallback, useMemo, useRef, useState } from "react";

import ActionTabs from "../../components/demography/action-tabs/action-tabs.component";
import CountryList from "../../components/demography/country-list/country-list.component";
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
import { useWikiCountries } from "../../fiber-apps/wiki-country/hooks/useWikiCountries";

import { IS_CLOUD_ENABLED } from "../../utils/firebase/provider";
import type { WikiCountry } from "../../utils/firebase/repo/wiki-country.types";

import useMapMemos from "./useMapMemos";
import useGameAppStore from "../../fiber-apps/demography-game/stores/useGameAppStore";

import {
  HalfContentBlock,
  BrowseSettlementContainer,
  NearbyItemsContainer,
} from "./map.styles";

//
//
//
const WikiDemography = () => {
  const { data: wikiCountries } = useWikiCountries(IS_CLOUD_ENABLED);
  //
  const tabs = ["Main Info", "Browse", "Search", "Nearby"];
  const [tabsIndex, setTabsIndex] = useState<number>(0);
  //
  const [topResultsLength, setTopResultsLength] = useState<number>(16);
  const [countryCode, setCountryCode] = useState<string>();
  const [selectedCountry, setSelectedCountry] = useState<WikiCountry>();
  //
  const [selectedCode, setSelectedCode] = useGameAppStore((s) => [
    s.selectedCode,
    s.setSelectedCode,
  ]);
  //
  const {
    countries,
    //
    tree,
    isTreeReady,
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
    topResultsLength
  );

  //
  //
  //
  const onCountryClicked = (c: WikiCountry) => {
    setCountryCode(c.code);
    setSelectedCountry(c);
  };
  const onCountryReset = () => {
    setCountryCode(undefined);
    setSelectedCountry(undefined);
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
    if (!isTreeReady) return null;
    //
    return (
      <DemographyGame3D
        tree={tree}
        selectedCountry={selectedCountry}
        path=".."
        scrollToDetails={scrollToDetails}
      />
    );
  }, [selectedCountry, tree, isTreeReady, scrollToDetails]);

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
  //  loading >> selectedCountry >> selectedCode
  //
  return (
    <div>
      {/* COUNTRY SELECTION */}
      {!selectedCountry ? (
        <>
          <h3>Available Countries</h3>
          <p>Please select a country to start.</p>
          <CountryList countries={countries} onClicked={onCountryClicked} />
        </>
      ) : (
        <ActionTabs
          tabs={tabs}
          tabsIndex={tabsIndex}
          setTabsIndex={setTabsIndex}
          selectedCode={selectedCode}
        />
      )}

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
          {tree && isTreeReady ? (
            <div>
              <h4 style={{ marginBottom: "5px" }}>
                Top {topOptions} Most Populated Places
              </h4>
              <CityList
                cities={topTenCities}
                onClicked={() => {
                  console.log("onCityClicked");
                }}
              />
            </div>
          ) : null}
        </>
      ) : null}

      {tabsIndex === 1 ? (
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

      {tabsIndex === 2 ? (
        <>
          <h3>Search for a Settlement</h3>
          {countryCode ? (
            <SettlementSearch tree={tree} countryCode={countryCode} />
          ) : null}
        </>
      ) : null}

      {tabsIndex === 3 ? (
        <>
          {/* NEARBY ITEMS */}
          {tree && selectedCountry && selectedCode ? (
            <div style={{ width: "100%" }}>
              <h3>
                Nearby {tree._n(selectedCode)?.name} ({selectedCode})
              </h3>

              <NearbyItemsContainer>
                <HalfContentBlock minWidth={"300px"}>
                  <NearbyTreeItems
                    tree={tree}
                    selectedCode={selectedCode}
                    setSelectedCode={setSelectedCode}
                  />
                </HalfContentBlock>
                <HalfContentBlock minWidth={"300px"}>
                  <NearbyMultiplyTreeItems
                    tree={tree}
                    selectedCode={selectedCode}
                  />
                </HalfContentBlock>
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
        <div style={{ marginTop: "15px" }}>
          {gameInCountry}
          {/* {selectedCountry ? (
            <DemographyGame3D
              tree={tree}
              selectedCountry={selectedCountry}
              path=".."
              scrollToDetails={scrollToDetails}
            />
          ) : null} */}
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
    </div>
  );
};

export default WikiDemography;
