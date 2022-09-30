import ReactForceGraph3d from "react-force-graph-3d";

import { CourseOverviewGraph, Footer } from "./course-overview.styles";

type CourseOverviewProps = {
  graphWidth: number;
  fgRef: any;
  data: any;
  onNodeClick: any;
  onEngineStop: any;
};

const CourseOverview = (props: CourseOverviewProps) => {
  const { graphWidth, fgRef, data, onNodeClick, onEngineStop } = props;
  //
  return (
    <div>
      <CourseOverviewGraph width={graphWidth + 5}>
        <ReactForceGraph3d
          rendererConfig={{ antialias: true, alpha: true }}
          width={graphWidth}
          height={300}
          ref={fgRef}
          graphData={data}
          nodeLabel={"name"}
          nodeResolution={6}
          nodeAutoColorBy={"group"}
          enableNodeDrag={false}
          onNodeClick={onNodeClick}
          linkDirectionalParticles={(d: any) => Math.round(d.value * 0.1)}
          linkDirectionalParticleSpeed={(d: any) => d.value * 0.00025}
          onEngineStop={onEngineStop}
        />
      </CourseOverviewGraph>
      <Footer>
        Displaying all the lectures from my completed Udemy courses.
      </Footer>
    </div>
  );
};

export default CourseOverview;
