import { useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import { Canvas } from "@react-three/fiber";

import { Center, OrbitControls } from "@react-three/drei";
import SvgComponent from "./svg.component";
import { Euler } from "three";
import styled from "styled-components";

const ShapeLoaderControls = styled.div`
  width: 350px;
  margin: auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
`;
const ShapeLoaderControlButton = styled.button`
  padding: 3px;
  margin: 5px;
`;

const ShapeLoaderApp3D = (props: {
  navigate: NavigateFunction;
  path?: string;
}) => {
  const [buildingVisible, setBuildingVisible] = useState<boolean>(false);
  const [logoVisible, setLogoVisible] = useState<boolean>(true);
  const [bagVisible, setBagVisible] = useState<boolean>(false);
  //
  const toggleBuildingVisibility = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => setBuildingVisible((b) => !b);
  //
  const toggleLogoVisibility = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => setLogoVisible((b) => !b);
  //
  const toggleBagVisibility = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => setBagVisible((b) => !b);

  const defaultRotation: Euler = new Euler(-Math.PI / 2, 0, Math.PI);

  return (
    <>
      <ShapeLoaderControls>
        <ShapeLoaderControlButton onClick={toggleBuildingVisibility}>
          {buildingVisible ? "Hide Building" : "Show Building"}
        </ShapeLoaderControlButton>
        <ShapeLoaderControlButton onClick={toggleLogoVisibility}>
          {logoVisible ? "Hide Logo" : "Show Logo"}
        </ShapeLoaderControlButton>
        <ShapeLoaderControlButton onClick={toggleBagVisibility}>
          {bagVisible ? "Hide Bag" : "Show Bag"}
        </ShapeLoaderControlButton>
      </ShapeLoaderControls>
      <Canvas frameloop="demand" shadows dpr={[1, 2]} camera={{ near: 0.1 }}>
        <OrbitControls enableZoom={true} />

        <ambientLight intensity={1} />

        <group rotation={[Math.PI / 2, 0, 0]}>
          <gridHelper />
          <Center>
            {buildingVisible && (
              <group>
                <SvgComponent
                  url={`./building.svg`}
                  rotation={defaultRotation}
                  scale={[0.025, 0.025, 0.01]}
                />
              </group>
            )}
            {logoVisible && (
              <group position={[0, 0, 1.15]}>
                <SvgComponent
                  url={`./test.svg`}
                  scale={[0.003, 0.003, 0.05]}
                  rotation={defaultRotation}
                />
              </group>
            )}
            {bagVisible && (
              <group position={[0, 0, 2.15]}>
                <SvgComponent
                  url={`./shopping-bag.svg`}
                  rotation={defaultRotation}
                  scale={[0.003, 0.003, 0.003]}
                />
              </group>
            )}
          </Center>
        </group>
      </Canvas>
    </>
  );
};

export default ShapeLoaderApp3D;
