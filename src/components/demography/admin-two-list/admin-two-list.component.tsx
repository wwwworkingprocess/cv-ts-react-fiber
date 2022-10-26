import { useState } from "react";

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
  const [myCode, setMyCode] = useState<string>();
  //
  return (
    <AdminTwoListContainer>
      {items.map((item) => {
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
              setSelectedCode(code);
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
    </AdminTwoListContainer>
  );
};

export default AdminTwoList;
