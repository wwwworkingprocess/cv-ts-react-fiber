import { useMemo } from "react";

//
// Retrieves metadata from WikiData about the
// entity specified by the qualifier. (e.g Q1003 or Q1186)
//
const useWikiChartData = (property: any, raw: any, skip: boolean) => {
  const data = useMemo(
    () =>
      !skip && property.code === "P1082" // "population"
        ? raw
            .map((r: any) => ({
              label: parseInt(
                r?.qualifiers?.P585?.[0]?.datavalue?.value?.time.split(
                  "-"
                )[0] ?? 2000
              ),
              value: parseInt(r?.mainsnak?.datavalue?.value?.amount ?? 0),
            }))
            .sort((a: any, b: any) => a.label - b.label)
        : [],
    [raw, property, skip]
  );
  //
  return data;
};

export default useWikiChartData;
