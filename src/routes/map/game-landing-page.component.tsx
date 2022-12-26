import { useCallback, useMemo } from "react";

import { useNavigate } from "react-router-dom";

import { Chart, CategoryScale } from "chart.js/auto";
import { Bar } from "react-chartjs-2";
//TODO: fix usage
import { useWikiCountries } from "../../fiber-apps/wiki-country/hooks/useWikiCountries";

import type { WikiCountry } from "../../utils/firebase/repo/wiki-country.types";
import { IS_CLOUD_ENABLED } from "../../utils/firebase/provider";
import { getAvailableCountryCodes } from "../../utils/country-helper";

import CountryList from "../../components/demography/country-list/country-list.component";

const availableCountryCodes = getAvailableCountryCodes();
const isAvailable = (c: WikiCountry) => availableCountryCodes.includes(c.code);
const sortByNameAsc = (a: WikiCountry, b: WikiCountry) =>
  a.name.localeCompare(b.name);

Chart.register(CategoryScale); // chart.js/auto also needed (disable tree shaking for the module)

const options = {
  indexAxis: "y" as const,
  elements: {
    bar: {
      borderWidth: 2,
    },
  },
  responsive: true,
  plugins: {
    legend: { position: "bottom" as const, visible: false },
    title: {
      display: true,
      text: "Top 25 Most Populated Countries",
    },
  },
};

const LineChart = (props: {
  chartData: Array<{ label: string; value: number }>;
}) => {
  const { chartData } = props;
  //
  const data = useMemo(() => {
    const labels = chartData.map((c) => c.label);
    const values = chartData.map((c) => c.value);
    //
    return {
      labels,
      datasets: [
        {
          label: "Population",
          data: values,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
      ],
    };
  }, [chartData]);

  //
  return (
    <div style={{ width: "100%" }}>
      <Bar data={data} options={options} />
    </div>
  );
};
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
  // Navigating to a valid country
  //
  const gotoGameInCountry = useCallback(
    (validCountryCode: string) => navigate(`./${validCountryCode}`),
    [navigate]
  );
  const onCountryClicked = (c: WikiCountry) => gotoGameInCountry(c.code);

  const gotoMainPage = useCallback(() => navigate(`./`), [navigate]);
  //
  const chartData = useMemo(
    () =>
      countries
        .map((c) => ({ label: c.name, value: c.population }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 25),
    [countries]
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
      <LineChart chartData={chartData} />
    </>
  );
};

export default GameLandingPage;
