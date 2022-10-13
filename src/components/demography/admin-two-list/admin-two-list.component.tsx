import {
  AdminTwoListContainer,
  AdminTwoListItem,
} from "./admin-two-list.styles";

type AdminTwoListProps = {
  items: Array<Array<any>>;
  //
  setSelectedCode: React.Dispatch<React.SetStateAction<string | undefined>>;
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
  return (
    <AdminTwoListContainer>
      {items.map((item) => {
        //
        const [code, name /*parentCode*/, , size, data] = item;
        //
        return (
          <AdminTwoListItem key={code} onClick={() => setSelectedCode(code)}>
            {name}
            <small style={{ float: "right" }}>
              {size} 🏠 {formatPopulation(data.pop)}
            </small>
          </AdminTwoListItem>
        );
      })}
    </AdminTwoListContainer>
  );
};

export default AdminTwoList;
