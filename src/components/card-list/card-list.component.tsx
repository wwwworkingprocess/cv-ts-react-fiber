import { CardListContainer } from "./card-list.styles";

const CardList = ({
  children,
  ...otherProps
}: {
  children: React.ReactNode;
}) => {
  return <CardListContainer {...otherProps}>{children}</CardListContainer>;
};

export default CardList;
