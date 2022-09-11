import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import ReactForceGraph3d from "react-force-graph-3d";
import { selectUdemyItems } from "../../store/udemy/udemy.selectors";

import useWindowSize from "../../hooks/useWindowSize";

import { Spinner } from "../../components/spinner/spinner.component";
import CompletedCourseCard from "../../components/card-completed/card-completed.component";
import CardList from "../../components/card-list/card-list.component";
import ExpandableGraph from "../../components/expandable-graph/expandable-graph.component";

const ids = [
  50522, 3792262, 2034156, 1594488, 1329100, 3138058, 851712, 2365628, 995016,
  159070,
];

const Courses = () => {
  const fgRef = useRef();
  //
  const [graphWidth, setGraphWidth] = useState(400);
  //
  const [selectedId, setSelectedId] = useState<number>(ids[0]);
  //
  const { windowSize } = useWindowSize();
  //
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ nodes: []; links: [] }>();
  //
  const items = useSelector(selectUdemyItems);
  //
  useEffect(() => {
    const fetchGraphData = () => {
      fetch("./data/index.json", { mode: "same-origin" })
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          // const with_id = json.nodes.filter((n: any) => n.data_id);
          //
          setLoading(false);
          setData(json);
        });
    };
    //
    fetchGraphData();
  }, []);

  useEffect(() => {
    if (windowSize) setGraphWidth(windowSize.width * 0.95);
  }, [windowSize]);

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
  const onEngineStop = useCallback(() => {
    if (fgRef.current) {
      (fgRef.current as any).zoomToFit(400);
    }
  }, [fgRef]);

  //
  return (
    <>
      Graph ID: {selectedId}
      <div
        style={{
          border: "solid 1px black",
          display: "flex",
          alignItems: "center",
          overflowX: "hidden",
        }}
      >
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
      </div>
      Courses
      <div style={{ margin: "auto", border: "solid 1px black" }}>
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
      {data ? (
        <div
          style={{
            width: "100%",
            height: "10%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {[2].map((rootId) => (
            <div
              style={{
                display: "flex",
                width: "70%",
                margin: "auto",
                maxWidth: "600px",
              }}
              key={rootId}
            >
              <ExpandableGraph
                rootId={rootId}
                graphData={{
                  nodes: [...data.nodes.map((n) => Object.assign({}, n))],
                  links: [...data.links.map((l) => Object.assign({}, l))],
                }}
                width={600}
                height={450}
              />
            </div>
          ))}
        </div>
      ) : (
        <Spinner />
      )}
    </>
  );
};

export default Courses;
