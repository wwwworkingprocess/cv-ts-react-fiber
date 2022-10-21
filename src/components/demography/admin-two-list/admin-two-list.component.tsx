import { useState } from "react";

import {
  AdminTwoListContainer,
  AdminTwoListItem,
} from "./admin-two-list.styles";

type AdminTwoListProps = {
  items: Array<Array<any>>;
  //
  setSelectedCode: (c: string | undefined) => void;
};

const formatPopulation = (p: number) => {
  if (p === -1) return "";
  if (p < 1000) return `${p}🧍`;
  if (p < 1000000) return `${(p * 0.001).toFixed(1)}k 🧍`;
  else return `${(p * 0.000001).toFixed(1)}M 🧍`;
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
        // const hasChildNodes = size > 0;
        const isSelected = code === myCode;
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
            <label>{name}</label>
            <small style={{ float: "right" }}>
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
