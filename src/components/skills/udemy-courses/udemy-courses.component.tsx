import type { CompletedCourse } from "../../../store/udemy/udemy.reducer";

import CompletedCourseCard from "../../card-completed/card-completed.component";
import CardList from "../../card-list/card-list.component";
import { Spinner } from "../../spinner/spinner.component";

type UdemyCoursesProps = {
  graphWidth: number;
  loading: boolean;
  items: Array<CompletedCourse>;
  setSelectedId: React.Dispatch<React.SetStateAction<number>>;
};

const UdemyCourses = (props: UdemyCoursesProps) => {
  const { graphWidth, loading, items, setSelectedId } = props;
  //
  return (
    <div style={{ margin: "auto", maxWidth: `${graphWidth}px` }}>
      {loading ? (
        <Spinner />
      ) : (
        <CardList>
          {items.map((it, idx) => (
            <CompletedCourseCard
              key={it.id}
              course={it}
              setSelectedId={setSelectedId}
            />
          ))}
        </CardList>
      )}
    </div>
  );
};

export default UdemyCourses;
