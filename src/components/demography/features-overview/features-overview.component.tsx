import { useCallback, useMemo } from "react";
import ReactForceGraph3d from "react-force-graph-3d";

import { FeaturesOverviewGraph, Footer } from "./features-overview.styles";

type CourseOverviewProps = {
  graphWidth: number;
  fgRef: any;
  data: any;
  setSelectedTypeId: any;
  // onNodeClick: any;
  // onEngineStop: any;
};

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
      (fgRef.current as any).zoomToFit(400);
    }
  }, [fgRef]);
  //
  return useMemo(
    () => ({ onNodeClick, onEngineStop }),
    [onNodeClick, onEngineStop]
  );
};

const FeaturesOverview = (props: CourseOverviewProps) => {
  const {
    graphWidth,
    fgRef,
    data,
    setSelectedTypeId,
    //  , onNodeClick, onEngineStop
  } = props;
  //
  const { onNodeClick, onEngineStop } = useGraphHandlers(fgRef);

  //
  return (
    <div>
      <FeaturesOverviewGraph width={graphWidth + 5}>
        <ReactForceGraph3d
          ref={fgRef}
          rendererConfig={{ antialias: true, alpha: true }}
          width={graphWidth}
          height={500}
          graphData={data}
          nodeLabel={"name"}
          nodeResolution={8}
          nodeAutoColorBy={"group"}
          enableNodeDrag={false}
          onNodeClick={(node) => {
            console.log("node click", node);
            onNodeClick(node);
            const typeId = parseInt(String(node.id ?? -1));
            setSelectedTypeId(typeId);
            //
            if (fgRef.current) {
              // (fgRef.current as any).zoomToFit(400);
            }
          }}
          linkDirectionalParticles={(d: any) =>
            d.value ? Math.min(200, Math.max(1, Math.round(d.value * 0.2))) : 0
          }
          linkDirectionalParticleSpeed={(d: any) => d.value * 0.00025}
          linkDirectionalParticleWidth={(d: any) => 2.5}
          linkDirectionalArrowLength={(d: any) => (d.value === 0 ? 0.1 : 10)}
          linkLabel={(d: any) => (d.value === 0 ? "" : d.label)}
          onEngineStop={onEngineStop}
        />
      </FeaturesOverviewGraph>
      <Footer>
        Displaying current type interpretation and number of instances.
      </Footer>
    </div>
  );
};

export default FeaturesOverview;
