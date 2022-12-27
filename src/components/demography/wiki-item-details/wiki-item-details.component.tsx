import { useMemo } from "react";

import { useWikiEntity } from "../../../hooks/wiki/useWikiEntity";

import { Spinner } from "../../spinner/spinner.component";
import GroupedClaims from "../grouped-claims/grouped-claims.component";

const WikiItemDetails = (props: {
  selectedCode: string | undefined;
  isVisible: boolean;
}) => {
  const { selectedCode, isVisible } = props;
  //
  const { loading, data } = useWikiEntity(selectedCode);
  //
  const wikiEntity = useMemo(
    () => (selectedCode ? (data as any)?.entities[selectedCode] : undefined),
    [data, selectedCode]
  );
  //
  //
  //
  return selectedCode ? (
    <>
      {loading && <div>Loading...</div>}
      {loading || !data ? (
        <Spinner />
      ) : (
        <GroupedClaims wikiEntity={wikiEntity} isVisible={isVisible} />
      )}
    </>
  ) : null;
};

export default WikiItemDetails;
