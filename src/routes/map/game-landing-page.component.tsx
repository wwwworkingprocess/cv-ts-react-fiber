import { useCallback, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

//TODO: fix usage
import { useWikiCountries } from "../../fiber-apps/wiki-country/hooks/useWikiCountries";

import type { WikiCountry } from "../../utils/firebase/repo/wiki-country.types";
import { IS_CLOUD_ENABLED } from "../../utils/firebase/provider";

import { getAvailableCountryCodes } from "../../config/country";

import CountryList from "../../components/demography/country-list/country-list.component";
import PopulationCountriesChart from "../../components/charts/population-countries-chart/population-countries-chart.component";
import Button from "../../components/button/button.component";

const availableCountryCodes = getAvailableCountryCodes();
const isAvailable = (c: WikiCountry) => availableCountryCodes.includes(c.code);
const isExcluded = (c: WikiCountry) => !availableCountryCodes.includes(c.code);
const sortByNameAsc = (a: WikiCountry, b: WikiCountry) =>
  a.name.localeCompare(b.name);

const pageSizeOptions = [3, 5, 10, 12, 15, 20, 25, 50, 100, 200];
//
// no country code selected
//
const GameLandingPage = () => {
  const navigate = useNavigate();

  //
  // Showing only valid and enabled countries
  //
  const { data: wikiCountries } = useWikiCountries(IS_CLOUD_ENABLED);
  //
  const countries = useMemo(
    () => wikiCountries?.filter(isAvailable).sort(sortByNameAsc) ?? [],
    [wikiCountries]
  );
  //
  const excludedCountries = useMemo(
    () => wikiCountries?.filter(isExcluded).sort(sortByNameAsc) ?? [],
    [wikiCountries]
  );

  //
  // Navigating to a valid country
  //
  const gotoGameInCountry = useCallback(
    (validCountryCode: string) => navigate(`./${validCountryCode}`),
    [navigate]
  );
  const onCountryClicked = (c: WikiCountry) => gotoGameInCountry(c.code);

  const gotoMainPage = useCallback(() => navigate(`../..`), [navigate]);
  //
  const [pageSize, setPageSize] = useState<number>(pageSizeOptions[2]);
  const onChangePagingOptions = useCallback((e: any) => {
    setPageSize(e.target.value);
    setPage(0);
  }, []);
  //
  const pagingOptions = useMemo(() => {
    return (
      <select value={pageSize} onChange={onChangePagingOptions}>
        {pageSizeOptions.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    );
  }, [pageSize, onChangePagingOptions]);

  const [page, setPage] = useState<number>(0);
  const lastPage = useMemo(
    () => Math.floor(countries.length / pageSize),
    [countries, pageSize]
  );

  const title = useMemo(
    () =>
      page === 0
        ? `Top ${pageSize} Most Populated Countries`
        : `Most Populated Countries (${page * pageSize}...${
            (page + 1) * pageSize
          })`,
    [page, pageSize]
  );

  const chartData = useMemo(
    () =>
      countries
        .map((c) => ({ label: c.name, value: c.population }))
        .sort((a, b) => b.value - a.value)
        .slice(page * pageSize, (page + 1) * pageSize),
    [countries, page, pageSize]
  );
  //
  //
  //
  return (
    <>
      <h3>Available Countries</h3>
      <p>
        Please select a country from the list below to start or use the{" "}
        <span
          onClick={gotoMainPage}
          style={{ color: "gold", cursor: "pointer" }}
        >
          map to select
        </span>
        .
      </p>
      <CountryList countries={countries} onClicked={onCountryClicked} />
      <div style={{ textAlign: "center" }}>
        {page !== 0 ? (
          <Button onClick={() => setPage((p) => Math.max(0, p - 1))}>
            Prev
          </Button>
        ) : null}{" "}
        {pagingOptions}{" "}
        {page !== lastPage ? (
          <Button onClick={() => setPage((p) => Math.min(lastPage, p + 1))}>
            Next
          </Button>
        ) : null}
        <PopulationCountriesChart
          data={chartData}
          title={title}
          label={"Population"}
        />
      </div>
      <h3>Excluded Countries</h3>
      <CountryList
        countries={excludedCountries}
        onClicked={() => console.log("skip, onCountryClicked")}
      />
      <br />
      {excludedCountries.map((c) => c.code).join(" - ")}
    </>
  );
};

export default GameLandingPage;
