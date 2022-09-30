import { FC } from "react";

// import { useDispatch, useSelector } from "react-redux";
import useMousePosition from "../../hooks/useMousePosition";
import { CompletedCourse } from "../../store/udemy/udemy.reducer";

import {
  CompletedCourseContainer,
  Footer,
  Name,
  Lectures,
} from "./card-completed.styles";

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
  const { title, image_240x135, num_lectures, url } = course;
  //
  const [x, y, bind] = useMousePosition();
  //
  // const dispatch = useDispatch();
  // const cartItems = useSelector(selectCartItems);
  // const addProductToCart = () => dispatch(addItemToCart(cartItems, product));
  //
  //  transform: `rotateX(${x / 15}deg) rotateY(${y / -5}deg)`,
  //
  return (
    <CompletedCourseContainer
      onClick={() => setSelectedId(course.id)}
      {...bind}
    >
      <img src={image_240x135 || DEFAULT_URL} alt={title} />
      <Lectures>
        <a
          href={`https://www.udemy.com${url}`}
          target={"_blank"}
          rel={"noreferrer"}
          title={title}
          style={{ color: "gold" }}
        >
          {num_lectures} lectures
        </a>
      </Lectures>
      <Footer>
        <Name>{title}</Name>
      </Footer>
    </CompletedCourseContainer>
  );
};

export default CompletedCourseCard;
