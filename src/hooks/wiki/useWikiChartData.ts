import { useMemo } from "react";

// TODO: handledprops, charttypes enum
const chartTypes = {
  P1082: "population",
  P2250: "life expectancy",
  P8328: "democracy index",
} as Record<string, string>;

//
// Data accessor functions
//
const readInt = (r: any) =>
  parseInt(r?.mainsnak?.datavalue?.value?.amount ?? 0);
const readFloat = (r: any) =>
  parseFloat(r?.mainsnak?.datavalue?.value?.amount ?? 0);
const readYear = (r: any) =>
  parseInt(
    r?.qualifiers?.P585?.[0]?.datavalue?.value?.time.split("-")[0] ?? 2000
  );

const sortByNumericLabel = (a: any, b: any) => a.label - b.label;

const readChartData = (raw: Array<any>, accessor?: (r: any) => any) =>
  !accessor
    ? raw
        .map((r: any) => ({ label: readYear(r), value: readInt(r) }))
        .sort(sortByNumericLabel)
    : raw
        .map((r: any) => ({ label: readYear(r), value: accessor(r) }))
        .sort(sortByNumericLabel);

//
// Returns a chartable dataset based on the passed in property and raw data
// Use 'skip' to disable the hook (dynamically)
//
const useWikiChartData = (property: any, raw: any, skip: boolean) => {
  const chartType = useMemo(
    () => (!skip ? String(chartTypes[property.code] ?? "") : ""),
    [property, skip]
  );

  //
  // Datasource for 'Population Development Chart' (P1082)
  //
  const dataPopulation = useMemo(
    () => (chartType === "population" ? readChartData(raw) : []),
    [raw, chartType]
  );

  //
  // Datasource for 'Life Expectancy Chart' (P2250)
  //
  const dataLifeExpectancy = useMemo(
    () =>
      chartType === "life expectancy" ? readChartData(raw, readFloat) : [],
    [raw, chartType]
  );

  //
  // Datasource for 'Democracy Index Chart' (P8328)
  //
  const dataDemocracyIndex = useMemo(
    () =>
      chartType === "democracy index" ? readChartData(raw, readFloat) : [],
    [raw, chartType]
  );

  //
  // Returning appropriate dataset based on chart type
  //
  const data = useMemo(
    () =>
      chartType === "population"
        ? dataPopulation
        : chartType === "life expectancy"
        ? dataLifeExpectancy
        : chartType === "democracy index"
        ? dataDemocracyIndex
        : [],
    [chartType, dataPopulation, dataLifeExpectancy, dataDemocracyIndex]
  );
  return data;
};

export default useWikiChartData;
