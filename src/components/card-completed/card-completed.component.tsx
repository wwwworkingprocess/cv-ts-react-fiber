import { FC } from "react";

import { useDispatch, useSelector } from "react-redux";
import useMousePosition from "../../hooks/useMousePosition";
import { CompletedCourse } from "../../store/udemy/udemy.reducer";

// import { selectCartItems } from "../../store/cart/cart.selector";
// import { addItemToCart } from "../../store/cart/cart.action";

// import Button, { BUTTON_TYPE_CLASSES } from "../button/button.component";

import {
  CompletedCourseContainer,
  Footer,
  Name,
  Price,
} from "./card-completed.styles";

// import { CategoryItem } from "../../store/categories/categories.types";
const DEFAULT_URL =
  "https://img-c.udemycdn.com/course/240x135/2365628_0b60_9.jpg";

type CompletedCourseCardProps = {
  course: CompletedCourse;
  setSelectedId: React.Dispatch<React.SetStateAction<number>>;
};

const CompletedCourseCard: FC<CompletedCourseCardProps> = ({
  course,
  setSelectedId,
}: CompletedCourseCardProps) => {
  const [x, y, bind] = useMousePosition();
  //
  // const dispatch = useDispatch();
  // const cartItems = useSelector(selectCartItems);
  //
  const { title, image_240x135, duration, num_lectures } = course;
  //
  // const addProductToCart = () => dispatch(addItemToCart(cartItems, product));
  //
  return (
    <CompletedCourseContainer
      onClick={() => setSelectedId(course.id)}
      {...bind}
      style={{
        transform: `rotateX(${x / 15}deg) rotateY(${y / -5}deg)`,
      }}
    >
      <img src={image_240x135 || DEFAULT_URL} alt={title} />
      <Footer>
        <Name>{title}</Name>
        <Price>{num_lectures}</Price>
      </Footer>
      {/* <Button
        buttonType={BUTTON_TYPE_CLASSES.inverted}
        onClick={addProductToCart}
      >
        Add to card
      </Button> */}
    </CompletedCourseContainer>
  );
};

export default CompletedCourseCard;
