import { useMemo, useState } from "react";

import { formatPopulation } from "../../../utils/wiki";

import {
  AdminTwoListContainer,
  AdminTwoListItem,
} from "./admin-two-list.styles";

type AdminTwoListProps = {
  items: Array<Array<any>>;
  //
  setSelectedCode: (c: string | undefined) => void;
};

const AdminTwoList = (props: AdminTwoListProps) => {
  const { items, setSelectedCode } = props;
  //
  const maxItems = 100;
  const topItems = useMemo(
    () => (items.length > maxItems ? items.slice(0, maxItems) : items),
    [items]
  );
  //
  const moreItems = useMemo(
    () => (items.length > maxItems ? items.slice(maxItems) : []),
    [items]
  );
  const hasMore = useMemo(() => moreItems.length > 0, [moreItems]);
  //
  const [myCode, setMyCode] = useState<string>();
  const [showMore, setShowMore] = useState<boolean>();
  //
  return (
    <AdminTwoListContainer>
      {(hasMore && showMore ? moreItems : topItems).map((item) => {
        //
        const [code, name /*parentCode*/, , size, data] = item;
        //
        const isSelected = code === myCode;
        const hasPosition = data && data.lat && data.lng;
        //
        return (
          <AdminTwoListItem
            key={code}
            onClick={() => {
              if (hasPosition) setSelectedCode(code);
              //
              setMyCode(code);
            }}
            style={{
              background: isSelected ? "rgba(255,255,255,0.3)" : "none",
            }}
          >
            {!hasPosition ? "[!] " : ""}
            <label>{name}</label>
            <small>
              {size ? `${size} 🏠 ` : ""}
              {formatPopulation(data.pop)}
            </small>
          </AdminTwoListItem>
        );
      })}
      {moreItems.length ? (
        <AdminTwoListItem
          style={{ display: "block", clear: "both", color: "yellow" }}
          onClick={() => {
            setShowMore(!showMore);
          }}
        >
          {!showMore ? moreItems.length : topItems.length} more items
        </AdminTwoListItem>
      ) : null}
    </AdminTwoListContainer>
  );
};

export default AdminTwoList;
