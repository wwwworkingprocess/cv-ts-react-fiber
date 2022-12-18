import { useCallback, useMemo } from "react";
import ReactForceGraph3d from "react-force-graph-3d";

import { FeaturesOverviewGraph, Header } from "./features-overview.styles";

type CourseOverviewProps = {
  graphWidth: number;
  fgRef: any;
  data: any;
  setSelectedTypeId: any;
};

const useGraphHandlers = (fgRef: React.MutableRefObject<any>) => {
  //
  // Center view on clicked node
  //
  const onNodeClick = useCallback(
    (node: any) => {
      // Aim at node from outside it
      const distance = 70;
      const r = 1 + distance / Math.hypot(node.x, node.y, node.z);
      const newPosition = { x: node.x * r, y: node.y * r, z: node.z * r };
      //
      if (fgRef.current) {
        (fgRef.current as any).cameraPosition(
          newPosition, // new position
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
  const { graphWidth, fgRef, data, setSelectedTypeId } = props;
  //
  const { onNodeClick, onEngineStop } = useGraphHandlers(fgRef);
  //
  return (
    <div>
      <Header>Active Feature Type Interpretation</Header>
      <div>
        Displaying type of represented feature layers and the number of features
        on each layer. <br />
        Click a node, to center selection and activate feature layer filter for
        map.
      </div>
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
            //
            if (fgRef.current) {
              const typeId = parseInt(String(node.id ?? -1));
              setSelectedTypeId(typeId);
              //
              onNodeClick(node);
            }
          }}
          linkDirectionalParticles={(d: any) =>
            d.value ? Math.min(200, Math.max(1, Math.round(d.value * 0.2))) : 0
          }
          linkDirectionalParticleSpeed={(d: any) => d.value * 0.00025}
          linkDirectionalParticleWidth={(d: any) => 3.5}
          linkDirectionalArrowLength={(d: any) => (d.value === 0 ? 0.1 : 10)}
          linkLabel={(d: any) => (d.value === 0 ? "" : d.label)}
          onEngineStop={onEngineStop}
        />
      </FeaturesOverviewGraph>
    </div>
  );
};

export default FeaturesOverview;
