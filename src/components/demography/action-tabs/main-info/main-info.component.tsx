import { ChangeEvent, useMemo } from "react";

import type { WikiCountry } from "../../../../utils/firebase/repo/wiki-country.types";

import CityList from "../../city-list/city-list.component";

type ActionTabMainInfoProps = {
  selectedCountry: WikiCountry | undefined;
  selectedTypeId: number | undefined;
  selectedCode: string | undefined;
  //
  isTreeReady: string | boolean | undefined; // ???? -> boolean
  permalink: string;
  //
  topTenCities: Array<any>;
  topTypeCities: Array<any>;
  allTypesWithPath: Array<any>;
  //
  topResultsLength: number;
  topTypeResultsLength: number;
  //
  onTypeEnabled: any;
  onTypeReset: any;
  onCountryReset: any;
  onGotoSearchButtonClicked: () => void;
  onChangeTopOptions: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangeTopTypeOptions: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangeType: (e: ChangeEvent<HTMLSelectElement>) => void;
  onPopulatedPlaceClicked: () => void;
  onFeatureOfTypeClicked: () => void;
};

//
//
//
const ActionTabMainInfo = (props: ActionTabMainInfoProps) => {
  const {
    selectedCountry,
    selectedTypeId,
    selectedCode,
    //
    isTreeReady,
    permalink,
    //
    topResultsLength,
    topTypeResultsLength,
    allTypesWithPath,
    //
    topTenCities,
    topTypeCities,
    //
    onTypeEnabled,
    onTypeReset,
    onCountryReset,
    onGotoSearchButtonClicked,
    onChangeTopOptions,
    onChangeTopTypeOptions,
    onChangeType,
    onPopulatedPlaceClicked,
    onFeatureOfTypeClicked,
  } = props;
  //

  //
  const topOptions = useMemo(() => {
    const options = [5, 10, 16, 20, 50];
    //
    return (
      <select value={topResultsLength} onChange={onChangeTopOptions}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    );
  }, [topResultsLength, onChangeTopOptions]);

  //
  const typeTopOptions = useMemo(() => {
    const options = [5, 10, 16, 20, 50, 100, 200];
    //
    return (
      <select value={topTypeResultsLength} onChange={onChangeTopTypeOptions}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    );
  }, [topTypeResultsLength, onChangeTopTypeOptions]);
  //
  return (
    <>
      {selectedCountry && (
        <>
          <h3>Country Details</h3>
          {!selectedCode ? (
            <p>
              Please{" "}
              <span
                style={{ color: "gold" }}
                onClick={onGotoSearchButtonClicked}
              >
                search
              </span>{" "}
              for a settlement to continue or{" "}
              <button onClick={onCountryReset}>select another country</button>.
            </p>
          ) : null}
        </>
      )}

      {isTreeReady ? (
        //{tree && typeTree && isTreeReady ? (
        <div>
          {selectedTypeId !== undefined ? (
            <button onClick={onTypeReset}>Clear type filter</button>
          ) : (
            <button onClick={onTypeEnabled}>Enable feature filtering</button>
          )}{" "}
          {permalink ? (
            <a href={permalink} title={"Permalink to this page"}>
              permalink
            </a>
          ) : null}
          {selectedTypeId === undefined ? (
            <>
              <h4 style={{ marginBottom: "5px" }}>
                Top {topOptions} Most Populated Places
              </h4>
              <CityList
                cities={topTenCities}
                onClicked={onPopulatedPlaceClicked}
              />
            </>
          ) : (
            <>
              <h4 style={{ marginBottom: "5px" }}>
                Top {typeTopOptions} Features matching type
                <select value={selectedTypeId} onChange={onChangeType}>
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
                onClicked={onFeatureOfTypeClicked}
              />
            </>
          )}
        </div>
      ) : null}
    </>
  );
};

export default ActionTabMainInfo;
