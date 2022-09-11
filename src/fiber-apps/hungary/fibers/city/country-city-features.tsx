import { useCallback, useMemo } from "react";

import { Instances } from "@react-three/drei";

import { BoxBufferGeometry, Color, MeshBasicMaterial, Vector3 } from "three";
import CountryCityFeature from "./country-city-feature";

const randomEuler = () => [0, 0, 0];

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
  const { treeNodes, parentColors, range } = props;
  //
  //
  //
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
  //
  //
  //
  const renderMemo = useMemo(() => {
    const randomData = Array.from(
      { length: treeNodes.length },
      (r: number = 1, idx: number) => ({
        position: getCityPositionAtIdx(idx),
        rotation: randomEuler(),
      })
    );
    //
    return randomData;
  }, [getCityPositionAtIdx, treeNodes]);
  //
  return (
    <group {...props}>
      <Instances
        count={range}
        material={new MeshBasicMaterial()}
        geometry={new BoxBufferGeometry(0.025, 0.025, 0.025)}
      >
        {renderMemo.map((props, i) => (
          <CountryCityFeature
            key={treeNodes[i].code}
            position={new Vector3(...props.position)}
            rotation={props.rotation as any}
            node={treeNodes[i]}
            color={parentColors[treeNodes[i].parent]}
          />
        ))}
      </Instances>
    </group>
  );
};

export default CountryCityFeatures;
