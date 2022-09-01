import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Mesh, Vector3 } from "three";
import {
  Billboard,
  Box,
  OrbitControls,
  Plane,
  RoundedBox,
  Text,
} from "@react-three/drei";
import styled from "styled-components";
import useKeyboardNavigation from "./hooks/useKeyboardNavigation";
import DynamicBox from "./fibers/dynamic-box";

type Position3D = { x: number; y: number; z: number };
const Scene = ({ x, y, z }: Position3D) => {
  const box = useRef<Mesh>(null!);
  const vec = new Vector3(x, y, z);
  //
  useFrame(() => box.current.position.lerp(vec, 0.1));
  //
  console.log("scene x,y,z", { x, y, z });
  //
  return (
    <Box ref={box} castShadow>
      <meshLambertMaterial attach="material" color="white" />
    </Box>
  );
};

const ControlsContainer = styled.div`
  position: relative;
  top: -50px;
  display: flex;
  font-size: 2rem;

  align-items: center;
  justify-content: center;

  label {
    background: none;
    border: none;
    font-weight: 600;
    color: palevioletred;
    padding: 0.4rem;
    margin: 0 1rem;
  }

  input {
    background: none;
    border: none;
    font-size: 2rem;

    color: orange;
    margin: 0 1rem;
    width: 60px;
  }
`;

const startPosition = { x: 1, y: 0, z: 0 };
//const [MIN_X, MAX_X, MIN_Y, MAX_Y] = [-3, 3, -2, 2];

const CursorNavigationDemo3D = (props: {
  isCameraEnabled: boolean;
  path?: string;
  bounds: [number, number, number, number];
}) => {
  const { bounds, isCameraEnabled } = props;
  const [MIN_X, MAX_X, MIN_Y, MAX_Y] = bounds;
  //
  const [position, setPosition] = useState<Position3D>(startPosition);
  const { x, y, z } = position;
  //
  const areaWidth = useMemo(() => Math.abs(MAX_X + 1 - MIN_X), [MIN_X, MAX_X]);
  const areaHeight = useMemo(() => Math.abs(MAX_Y + 1 - MIN_Y), [MIN_Y, MAX_Y]);
  const areaScale = useMemo(
    () => new Vector3(areaWidth, areaHeight, 0.15),
    [areaWidth, areaHeight]
  );

  useKeyboardNavigation({ bounds, setPosition });

  //
  // reposition the box when it gets ouf of bounds
  //
  const isInBounds = useMemo(() => {
    const { x, z } = position;
    const valid_x = MIN_X <= x && x <= MAX_X;
    const valid_y = MIN_Y <= z && z <= MAX_Y;
    //
    return valid_x && valid_y;
  }, [position, MIN_X, MAX_X, MIN_Y, MAX_Y]);

  useEffect(() => {
    setPosition(startPosition);
  }, [isInBounds]);
  //
  return (
    <>
      <Canvas shadows dpr={[1, 2]}>
        {isCameraEnabled && (
          <OrbitControls
            minPolarAngle={0}
            maxPolarAngle={(Math.PI / 7) * 2}
            maxDistance={10}
          />
        )}
        <spotLight position={[10, 20, 10]} angle={0.15} penumbra={1} />
        <pointLight
          position={[10, 10, 10]}
          intensity={0.5}
          castShadow
          shadow-mapSize-height={512}
          shadow-mapSize-width={512}
        />
        <Billboard
          position={[0, 3.25, 0]}
          follow={true}
          lockX={false}
          lockY={false}
          lockZ={false} // Lock the rotation on the z axis (default=false)
        >
          <Text fontSize={0.4} color={"#ffaa22"}>
            Use arrow keys for navigation and space for jump
          </Text>
        </Billboard>
        <Plane
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -1, 0]}
          args={[1000, 1000]}
        >
          <meshStandardMaterial attach="material" color="silver" />
        </Plane>
        <DynamicBox areaScale={areaScale} position={[0, -1 - 0.02, 0]} />

        <group position={[0, -0.5 + 0.05, 0]}>
          <Scene x={x} y={y} z={z} />
        </group>
      </Canvas>
      <ControlsContainer>
        <label>x</label>
        <input
          min={MIN_X}
          max={MAX_X}
          onChange={(e) =>
            setPosition({ ...position, x: parseInt(e.target.value) })
          }
          value={position.x}
          type="number"
        />
        <label>y</label>
        <input
          min={0}
          max={10}
          onChange={(e) =>
            setPosition({ ...position, y: parseInt(e.target.value) })
          }
          value={position.y}
          type="number"
        />
        <label>z</label>
        <input
          min={MIN_Y}
          max={MAX_Y}
          onChange={(e) =>
            setPosition({ ...position, z: parseInt(e.target.value) })
          }
          value={position.z}
          type="number"
        />
      </ControlsContainer>
    </>
  );
};

export default CursorNavigationDemo3D;
