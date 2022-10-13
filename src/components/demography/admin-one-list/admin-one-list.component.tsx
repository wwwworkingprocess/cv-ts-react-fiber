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
  setSelectedCode: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const formatPopulation = (p: number) => {
  if (p === -1) return "";
  if (p < 1000) return `${p}🧍`;
  if (p < 1000000) return `${(p * 0.001).toFixed(1)}k 🧍`;
  else return `${(p * 0.000001).toFixed(1)}M 🧍`;
};

const AdminOneList = (props: AdminOneListProps) => {
  const { items, setSelectedCode } = props;
  //
  return (
    <AdminOneListContainer>
      {items.map(({ code, name, countryCode, size, data }) => {
        //
        return (
          <AdminOneListItem key={code} onClick={() => setSelectedCode(code)}>
            <small style={{ width: "50px" }}>
              {size} 🏠 {formatPopulation(data.pop)}
            </small>{" "}
            {name}
          </AdminOneListItem>
        );
      })}
    </AdminOneListContainer>
  );
};

export default AdminOneList;
