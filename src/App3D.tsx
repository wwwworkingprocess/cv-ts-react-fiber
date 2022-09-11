import { useState, useRef } from "react";

import { Canvas, useFrame } from "@react-three/fiber";
import { Extrude, OrbitControls } from "@react-three/drei";

import { Dice } from "./three-components/dice/dice.component";
import MyText from "./three-components/text-3d/text-3d.component";
import {
  BoxBufferGeometry,
  Color,
  DoubleSide,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
} from "three";
import { shapeFromCoords, shapeRoundedRectangle } from "./utils/d3d";

import hungarianBorder from "./fiber-apps/hungary/border.28.json";

const tempBoxes = new Object3D();

const Boxes = ({
  i,
  j,
  baseColor,
}: {
  i: number;
  j: number;
  baseColor: Color;
}) => {
  const material = new MeshStandardMaterial({
    // color: baseColor,
  });
  const boxesGeometry = new BoxBufferGeometry(0.5, 0.5, 0.5);
  const ref = useRef<InstancedMesh>(null!);

  useFrame(({ clock }) => {
    if (ref.current) {
      let counter = 0;
      const t = clock.oldTime * 0.0001;
      //
      for (let x = 0; x < i; x++) {
        for (let z = 0; z < j; z++) {
          const id = counter++;
          //
          tempBoxes.position.set(i / 2 - x, id % 10, j / 2 - z);
          tempBoxes.rotation.y = t;
          tempBoxes.updateMatrix();
          //
          ref.current.setMatrixAt(id, tempBoxes.matrix);
          //
          ref.current.setColorAt(
            id,
            new Color(
              0.2 * Math.abs(1 - Math.cos(t * 1000 * x)) * baseColor.r,
              ((0.9 * (Math.abs(Math.sin(t)) * 1 + 0.1)) / (z + 1)) *
                baseColor.g,
              0.2 * Math.abs(Math.cos(t)) * baseColor.b
            )
          );
        }
      }
      ref.current.instanceMatrix.needsUpdate = true;
    }
  });

  return <instancedMesh ref={ref} args={[boxesGeometry, material, i * j]} />;
};

const App3D = (props: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  // const { setIsOpen } = props;

  const [scale, setScale] = useState<number>(2);
  //
  const countryBorderPoints = hungarianBorder.coordinates as Array<
    [number, number]
  >;
  //
  const extrudeOptions = {
    size: 4,
    height: 3,
    curveSegments: 32,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.025,
    bevelOffset: 0,
    bevelSegments: 8,
  };
  //const extrudeArgs = [shapeFromCoords(countryBorderPoints), extrudeOptions];

  const [boxColor] = useState<Color>(
    new Color(0.3 * Math.random(), 0.9 * Math.random(), 0.2 * Math.random())
  );
  //
  return (
    <>
      <input
        type="number"
        value={scale}
        onChange={(e) => setScale(parseInt(e.target.value))}
      />
      <Canvas>
        <OrbitControls enableZoom={true} />

        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />

        <mesh {...props}>
          <shapeGeometry args={[shapeRoundedRectangle(2.5, 5, 0.2)]} />
          <meshLambertMaterial color="gold" side={DoubleSide} />
        </mesh>

        <Dice />

        <MyText
          position={[0, 3, 0]}
          // color="black"
          // anchorX="center"
          // anchorY="middle"
        >
          Welcome to Reactive 3D!
        </MyText>
        <Extrude
          position={[-1, -5, -2]}
          args={[shapeRoundedRectangle(2.5, 5, 0.2), { bevelSize: 0.1 }]}
        ></Extrude>
        <Extrude
          scale={[1, 1, 0.0725]}
          position={[-1, -5, -4]}
          args={[shapeRoundedRectangle(2.5, 5, 0.2), { bevelSize: 0.1 }]}
        >
          <meshStandardMaterial color="lightblue" side={DoubleSide} />
        </Extrude>
        <group position={[-20 - 5, -47, -3]}>
          <Extrude
            scale={[1, 1, 0.15]}
            args={[shapeFromCoords(countryBorderPoints), { ...extrudeOptions }]}
          >
            <meshStandardMaterial color="lightgreen" side={DoubleSide} />
          </Extrude>
        </group>
        <group position={[-20 - 5, -47 - 5, -3]}>
          <Extrude
            args={[shapeFromCoords(countryBorderPoints), { ...extrudeOptions }]}
          ></Extrude>
        </group>
        <Boxes i={128} j={128} baseColor={boxColor} />
      </Canvas>
    </>
  );
};

export default App3D;
