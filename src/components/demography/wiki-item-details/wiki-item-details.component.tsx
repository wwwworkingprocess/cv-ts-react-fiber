import { useMemo } from "react";

import { useWikidata } from "../../../hooks/useWikidata";

import { Spinner } from "../../spinner/spinner.component";
import GroupedClaims from "../grouped-claims/grouped-claims.component";

const WikiItemDetails = (props: { selectedCode: string | undefined }) => {
  const { selectedCode } = props;
  //
  const { loading: wikiLoading, data } = useWikidata(selectedCode);
  //
  const wikiEntry = useMemo(
    () => (selectedCode ? (data as any)?.entities[selectedCode] : undefined),
    [data, selectedCode]
  );
  //
  //
  //
  return selectedCode ? (
    <>
      {wikiLoading && <div>Loading...</div>}
      {wikiLoading || !data ? (
        <Spinner />
      ) : (
        <GroupedClaims wikiEntry={wikiEntry} />
      )}
    </>
  ) : null;
};

export default WikiItemDetails;
