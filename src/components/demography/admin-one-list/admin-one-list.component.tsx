import { useMemo, useState } from "react";

import {
  AdminOneListContainer,
  AdminOneListItem,
} from "./admin-one-list.styles";

type AdminOneListProps = {
  items: Array<{
    code: string;
    name: string;
    countryCode: number;
    size: number;
    data: Record<string, any>;
  }>;
  //
  setSelectedCode: (c: string | undefined) => void;
};

const AdminOneList = (props: AdminOneListProps) => {
  const { items, setSelectedCode } = props;
  //
  const [myCode, setMyCode] = useState<string>();
  //
  const MAX_TO_SHOW = 150;
  //
  const itemsMemo = useMemo(
    () => (items ? items.slice(0, MAX_TO_SHOW) : []),
    [items, MAX_TO_SHOW]
  );
  //
  return (
    <AdminOneListContainer>
      {itemsMemo.map(({ code, name, countryCode, size, data }) => {
        //
        return (
          <AdminOneListItem
            key={code}
            onClick={() => {
              setMyCode(code);
              setSelectedCode(code);
            }}
            style={{
              background: code === myCode ? "rgba(255,255,255,0.3)" : "none",
            }}
          >
            <small
              style={{
                fontSize: size > 99 ? "10px" : "13px",
                textAlign: "center",
              }}
            >
              {size} <span>🏠</span>
            </small>
            <label>{name}</label>
          </AdminOneListItem>
        );
      })}
    </AdminOneListContainer>
  );
};

export default AdminOneList;
