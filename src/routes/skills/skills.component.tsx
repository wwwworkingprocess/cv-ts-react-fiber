import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { selectUdemyItems } from "../../store/udemy/udemy.selectors";

import useWindowSize from "../../hooks/useWindowSize";

import LinkedInBadges from "../../components/skills/linked-in-badges/linked-in-badges.component";
import UdemyCourses from "../../components/skills/udemy-courses/udemy-courses.component";
import CourseOverview from "../../components/skills/course-overview/course-overview.component";

const ids = [
  50522, 3792262, 2034156, 1594488, 1329100, 3138058, 851712, 2365628, 995016,
  159070,
];

const useGraphHandlers = (fgRef: React.MutableRefObject<any>) => {
  //
  // Center view on clicked node
  //
  const onNodeClick = useCallback(
    (node: any) => {
      // Aim at node from outside it
      const distance = 40;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

      if (fgRef.current) {
        (fgRef.current as any).cameraPosition(
          {
            x: node.x * distRatio,
            y: node.y * distRatio,
            z: node.z * distRatio,
          }, // new position
          node, // lookAt ({ x, y, z })
          3000 // ms transition duration
        );
      }
    },
    [fgRef]
  );

  //
  // Set viewport to show whole graph (disabled)
  //
  const onEngineStop = useCallback(() => {
    if (fgRef.current) {
      // (fgRef.current as any).zoomToFit(400);
    }
  }, [fgRef]);
  //
  return useMemo(
    () => ({ onNodeClick, onEngineStop }),
    [onNodeClick, onEngineStop]
  );
};

const useGraphData = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ nodes: []; links: [] }>();
  //
  useEffect(() => {
    const fetchGraphData = () => {
      fetch("./data/index.json")
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          setLoading(false);
          setData(json);
        });
    };
    //
    fetchGraphData();
  }, []);

  return useMemo(() => ({ loading, data }), [loading, data]);
};

const Skills = () => {
  const fgRef = useRef();
  const { onNodeClick, onEngineStop } = useGraphHandlers(fgRef);
  const { loading, data } = useGraphData();
  const { windowSize } = useWindowSize();
  //
  const items = useSelector(selectUdemyItems);
  //
  const [graphWidth, setGraphWidth] = useState(400);
  const [, setSelectedId] = useState<number>(ids[0]);
  //
  useEffect(() => {
    if (windowSize) setGraphWidth(windowSize.width * 0.9);
  }, [windowSize]);
  //
  return (
    <>
      <h2>LinkedIn Skill Badges</h2>
      <LinkedInBadges />
      <br />
      <h2>Courses Completed recently</h2>
      <UdemyCourses
        loading={loading}
        graphWidth={graphWidth}
        items={items}
        setSelectedId={setSelectedId}
      />
      {/* Course: {selectedId} */}
      <br />
      <h2>Overview of Courses</h2>
      <CourseOverview
        graphWidth={graphWidth}
        fgRef={fgRef}
        data={data}
        onNodeClick={onNodeClick}
        onEngineStop={onEngineStop}
      />
    </>
  );
};

export default Skills;
