import * as THREE from "three";
import { useCallback, useMemo } from "react";
import {} from "@react-three/fiber";
import { Instances } from "@react-three/drei";

import { BoxBufferGeometry, Color, MeshBasicMaterial, Vector3 } from "three";
import CountryCityFeature from "./country-city-feature";

const randomEuler = () => [0, 0, 0];
//  [
//   Math.random() * Math.PI,
//   Math.random() * Math.PI,
//   Math.random() * Math.PI,
// ];

const CountryCityFeatures = (
  props: JSX.IntrinsicElements["group"] & {
    range: number;
    treeNodes: Array<{
      name: string;
      parent: number;
      code: number;
      coords: [number, number];
      pop: number;
    }>;
    parentColors: Record<string, Color>;
  }
) => {
  const { range, treeNodes, parentColors } = props;

  const getCityPositionAtIdx = useCallback(
    (idx: number) => {
      const node = treeNodes ? treeNodes[idx] : undefined;
      //
      let p = [0, 0, 0];
      //
      if (node) {
        const pos = (node?.coords ?? [0, 0]) as [number, number];
        //
        const s = 1;
        p = [pos[1] * s, pos[0] * s, 0.05];
      }
      //
      return p;
    },
    [treeNodes]
  );

  const renderMemo = useMemo(() => {
    const randomData = Array.from(
      { length: treeNodes.length },
      (r: number = 1, idx: number) => ({
        position: getCityPositionAtIdx(idx),
        rotation: randomEuler(),
        // color: colorByParent(x),
      })
    );

    console.log("new rendermemo", randomData.length);

    return randomData;
  }, [getCityPositionAtIdx, treeNodes.length]);

  const colorByParent = useCallback(
    (node: { parent: number }) => {
      if (parentColors) {
        const parentCode = node.parent || 3;
        const parentColor = parentColors[parentCode];
        //
        return parentColor;
      }

      return new Color("white");
    },
    [parentColors] //  [treeNodes, parentColors]
  );

  return (
    <group {...props}>
      <Instances
        // frustumCulled={false}
        // range={renderMemo.length}
        // count={range}
        // range={range}

        material={new MeshBasicMaterial()}
        geometry={new BoxBufferGeometry(0.025, 0.025, 0.025)}
      >
        {renderMemo.map((props, i) => (
          <CountryCityFeature
            key={i}
            //   {...props}
            position={new Vector3(...props.position)}
            rotation={props.rotation as any}
            node={treeNodes[i]}
            color={colorByParent(treeNodes[i])}
          />
        ))}
      </Instances>
    </group>
  );
};

export default CountryCityFeatures;
