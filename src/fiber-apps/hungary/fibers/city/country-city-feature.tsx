import { Html, Instance } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";

import styled from "styled-components";

import { Color, Vector3 } from "three";
import { lerp } from "three/src/math/MathUtils";

const colorHelper = new Color();

const CountryCityFeature = (
  props: JSX.IntrinsicElements["group"] & {
    node: {
      name: string;
      parent: number;
      code: number;
      coords: [number, number];
      pop: number;
    };
    color: Color; // | undefined;
  }
) => {
  const { color, node } = props;
  //
  const pos = node?.coords ?? [0, 0];
  //
  const ref = useRef<any>(null!); // reference of city instance

  const [MIN_POP, MAX_POP] = [100, 1000000];
  const currentPop = Math.max(MIN_POP, Math.min(node.pop, MAX_POP));
  const logScale = 0.3 * Math.log10(currentPop);

  //
  // state
  //
  const [hovered, setHover] = useState(false);
  const [myColor] = useState<Color>(new Color(color.r, color.g, color.b));
  const [myScale] = useState<Vector3>(
    new Vector3(logScale, logScale, logScale)
  );

  useFrame((state) => {
    if (ref.current) {
      ref.current.scale.x =
        ref.current.scale.y =
        ref.current.scale.z =
          lerp(ref.current.scale.z, hovered ? 1.4 : myScale.x, 0.1);
      //
      ref.current.color.lerp(
        colorHelper.set(hovered ? "red" : color),
        hovered ? 1 : 0.1
      );
    }
  });
  //
  const onPointerOut = (e: ThreeEvent<PointerEvent>) => setHover(false);
  //
  //
  //
  const onPointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHover(true);
    //
    console.log("color", color, myColor, e.object.userData);
    //
    // const newSelection = `Q${e.object.userData.code}`;
    // setSelectedCode(newSelection);
    // changeCitySelection();
  };

  //
  return (
    <group {...props}>
      <Instance
        userData={node}
        ref={ref}
        color={color}
        scale={myScale}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        {hovered ? (
          //   <Html distanceFactor={10}>
          <Html>
            <Tooltip>
              {node.name}
              <br />[{pos.map((p: number) => p.toFixed(3)).join(",")}]
              <br />
              {node.pop}
            </Tooltip>
          </Html>
        ) : null}
      </Instance>
    </group>
  );
};

const Tooltip = styled.div`
  padding-top: 10px;
  //   transform: translate3d(50%, 0, 0);
  text-align: left;
  background: #202035;
  color: white;
  padding: 5px 5px;
  border-radius: 2px;
  margin-left: 5px;
`;
//

export default CountryCityFeature;
