import { useState } from "react";

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
  return (
    <AdminOneListContainer>
      {items.map(({ code, name, countryCode, size, data }) => {
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
            <small>
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
