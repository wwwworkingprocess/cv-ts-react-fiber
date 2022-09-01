import { useState, useMemo, useCallback, useRef } from "react";
import ReactForceGraph3d, { GraphData, NodeObject } from "react-force-graph-3d";

function genRandomTree(N = 300, reverse = false) {
  return {
    nodes: [...Array.from(new Array(N).keys())].map((i) => ({ id: i })),
    links: [...Array.from(new Array(N).keys())]
      .filter((id) => id)
      .map((id) => ({
        [reverse ? "target" : "source"]: id,
        [reverse ? "source" : "target"]: Math.round(Math.random() * (id - 1)),
      })),
  };
}

const ExpandableGraph = ({
  graphData = genRandomTree(600, true),
  width,
  height,
  rootId,
}: {
  graphData: GraphData | undefined;
  width: number;
  height: number;
  rootId: number;
}) => {
  const graphRef = useRef();

  //
  // const rootId = 2;
  // const rootId = 1;
  // const rootId = 700002;
  console.log("rootId", rootId);
  console.log("GD rnd", graphData);

  const nodesById = useMemo(() => {
    if (graphData) {
      console.log("memo input", graphData);
      const nodes = Object.fromEntries(
        graphData.nodes.map((node: NodeObject) => [node.id, node])
      );

      console.log("nodes", nodes);
      // link parent/children
      graphData.nodes.forEach(
        // (node: NodeObject & { collapsed: boolean; childLinks: Array<any> }) => {
        (node: any) => {
          node.collapsed = node.id !== rootId;
          node.childLinks = [];
        }
      );
      graphData.links.forEach((link: any) => {
        // console.log("adding link", link.source, link);

        // nodes[link.source].childLinks.push(link);   // using source

        nodes[link.target]?.childLinks.push(link); // using target
      });

      console.log("memo output", nodes);

      return nodes;
    } else return {};
  }, [graphData]);

  const getPrunedTree = useCallback(() => {
    if (nodesById) {
      console.log("nodesById changed", nodesById);
      const visibleNodes = [];
      const visibleLinks = [];
      //
      //
      (function traverseTree(node = nodesById[rootId]) {
        // console.log("traversing", node?.id, node.childLinks?.length);
        if (node) {
          visibleNodes.push(node);
          //
          if (node.collapsed) return;
          //
          visibleLinks.push(...node.childLinks);
          //
          node.childLinks
            .map((link: any) =>
              //   typeof link.target === "object"      // using target
              //     ? link.target
              //     : nodesById[link.target]

              typeof link.source === "object" // using source
                ? link.source
                : nodesById[link.source]
            ) // get child node
            .forEach((n: any) => {
              console.log("traversing on n", n);
              traverseTree(n);
            });
        }
      })();
      //
      //
      console.log("pruned", { nodes: visibleNodes, links: visibleLinks });
      return { nodes: visibleNodes, links: visibleLinks };
    } else return { nodes: [], links: [] };
  }, [nodesById, rootId]);

  const [prunedTree, setPrunedTree] = useState(getPrunedTree());

  const centerViewOnNode = useCallback(
    (node: any) => {
      if (graphRef.current) {
        const distance = 100;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

        //
        const zoom = () =>
          (graphRef.current as any).cameraPosition(
            {
              x: node.x * distRatio,
              y: node.y * distRatio,
              z: node.z * distRatio,
            }, // new position
            node, // lookAt ({ x, y, z })
            3000 // ms transition duration
          );
        //
        setTimeout(zoom, 2000);
      }
    },
    [graphRef]
  );

  const handleNodeClick = useCallback(
    (node: any) => {
      node.collapsed = !node.collapsed; // toggle collapse state
      setPrunedTree(getPrunedTree());
      //
      centerViewOnNode(node);
    },
    [rootId]
  );

  return (
    <ReactForceGraph3d
      ref={graphRef}
      graphData={prunedTree}
      width={width}
      height={height}
      nodeLabel={"name"}
      nodeResolution={6}
      nodeAutoColorBy={"group"}
      enableNodeDrag={false}
      onNodeClick={handleNodeClick}
      linkDirectionalParticles={(d: any) => Math.round(d.value * 0.1)}
      linkDirectionalParticleSpeed={(d: any) => d.value * 0.00025}
    />
  );
};

export default ExpandableGraph;
