import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";

import styled from "styled-components";

const Tooltip = styled.div`
  padding-top: 10px;
  transform: translate3d(50%, 0, 0);
  text-align: left;
  background: #202035;
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
`;
//
const Box = (
  props: JSX.IntrinsicElements["mesh"] & {
    // setIsOpen: any;
    onNavigate: () => void;
    tooltipText: string;
  }
) => {
  const { onNavigate, tooltipText } = props;
  // This reference will give us direct access to the THREE.Mesh object
  const ref = useRef<THREE.Mesh>(null!);
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame((state, delta) => (ref.current.rotation.x += hovered ? 0.01 : 0));

  //

  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => {
        click(!clicked);
        onNavigate();
        //
        if (ref.current) console.info(ref.current.userData.tooltipText);
      }}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}
      userData={{ tooltipText }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "green" : "blue"} />
      {hovered ? (
        <Html distanceFactor={10}>
          <Tooltip
          // className="content"
          >
            hello <br />
            {tooltipText}
          </Tooltip>
        </Html>
      ) : (
        <></>
      )}
    </mesh>
  );
};

export default Box;
