import { useState, useRef, useMemo } from "react";

import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, OrbitControls, Sky, Text } from "@react-three/drei";

import MyText from "./three-components/text-3d/text-3d.component";
import {
  BoxBufferGeometry,
  Color,
  Group,
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from "three";

//import { shapeFromCoords, shapeRoundedRectangle } from "./utils/d3d";

import hungarianBorder from "./fiber-apps/hungary/border.28.json";
import { ShaderPlaneMesh } from "./three-components/image-plane/shader-material";
import ImagePlane from "./three-components/image-plane/image-plane.component";
import GridFloor from "./fiber-apps/heightmap-random/fibers/grid/grid-floor";
import { Draggable } from "./three-components/draggable/draggable.component";
import { Dice } from "./three-components/dice/dice.component";

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
  const boxesGeometry = new BoxBufferGeometry(0.05, 0.29, 0.05);
  const ref = useRef<InstancedMesh>(null!);

  useFrame(({ clock }) => {
    if (ref.current) {
      let counter = 0;
      const t = clock.oldTime * 0.01;
      //
      //
      for (let x = 0; x < i; x++) {
        for (let z = 0; z < j; z++) {
          const id = counter++;
          //
          const a = x / i;
          const b = z / j;
          const sinT = Math.sin((t / Math.PI) * a * b);
          //
          const diffByT = 0.01 + (sinT + 0.8) * 0.042;
          tempBoxes.position.set(
            i / 2 - x,
            -0.29 / 2 + 0.041 + diffByT * 1.41,
            j / 2 - z
          );
          tempBoxes.rotation.y = t * 0.02;
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
  const [scale, setScale] = useState<number>(2);
  //
  // const countryBorderPoints = hungarianBorder.coordinates as Array<
  //   [number, number]
  // >;
  // //
  // const extrudeOptions = {
  //   size: 4,
  //   height: 3,
  //   curveSegments: 32,
  //   bevelEnabled: true,
  //   bevelThickness: 0.06,
  //   bevelSize: 0.025,
  //   bevelOffset: 0,
  //   bevelSegments: 8,
  // };
  // //const extrudeArgs = [shapeFromCoords(countryBorderPoints), extrudeOptions];

  // const [boxColor] = useState<Color>(
  //   new Color(0.3 * Math.random(), 0.9 * Math.random(), 0.2 * Math.random())
  // );

  const [heightViewPort, setHeightViewPort] = useState<
    [number, number, number, number] | undefined
  >([0, 0, 120, 120]);

  //
  const refDynamicText = useRef<string>("");
  //
  const [drag, setDrag] = useState(false);
  const dragProps = {
    onDragStart: (event: any) => setDrag(true),
    onDragEnd: (event: any) => {
      setDrag(false);
      console.log("dragend", event);
      refDynamicText.current = JSON.stringify(
        event.eventObject.position
          .toArray()
          .map((coord: number) => coord.toFixed(3))
      );
    },
  };
  //
  const boxesMemo = useMemo(
    () => (
      <group scale={[10 / 36, 1, 10 / 36]} position={[0, -0.12, 0]}>
        <Boxes i={36} j={18} baseColor={new Color(1, 1, 1)} />
      </group>
    ),
    []
  );
  //
  return (
    <>
      {/* <input
        type="number"
        value={scale}
        onChange={(e) => setScale(parseInt(e.target.value))}
      /> */}
      <Canvas
        camera={{
          // far: 5,
          far: 50,
          fov: 50,
          position: [0.16, 0.22, 0.55],
          aspect: 16 / 9,
        }}
      >
        <OrbitControls
          enabled={!drag}
          enableZoom={true}
          autoRotate
          autoRotateSpeed={0.2}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2.5}
          maxDistance={8}
        />

        <group position={[0, 0.05, 0]}>
          <Draggable {...dragProps}>
            <Billboard>
              <Text fontSize={0.01} position={[0, 0.051, 0]}>
                Drag me!
              </Text>
            </Billboard>
            <mesh>
              <boxGeometry args={[0.051, 0.051, 0.051]} />
              <meshLambertMaterial color={"pink"} />
            </mesh>
          </Draggable>
        </group>

        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />

        {/* <mesh {...props}>
          <shapeGeometry args={[shapeRoundedRectangle(2.5, 5, 0.2)]} />
          <meshLambertMaterial color="gold" side={DoubleSide} />
        </mesh>
 */}

        <MyText
          position={[0, 0.13, -2.8]}
          fontSize={0.5}
          bevelSize={0.2}
          fontColor={"#afafff"}
          // color="black"
          // anchorX="center"
          // anchorY="middle"
        >
          Welcome to Reactive 3D!
        </MyText>
        <MyText
          position={[0, 0.38, -2.8]}
          fontSize={0.125}
          bevelSize={0.051}
          fontColor={"#afafff"}
          // color="black"
          // anchorX="center"
          // anchorY="middle"
        >
          {refDynamicText.current}
        </MyText>

        {/* <Extrude
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
        </group> */}

        <Sky
          distance={450000}
          sunPosition={[0, 1, 0]}
          inclination={0}
          azimuth={0.25}
        />
        <group rotation={[-Math.PI / 2, 0, 0]}>
          {/* <SeaLevel width={10} segments={10} /> */}
          <mesh>
            <planeBufferGeometry args={[120, 60, 10, 10]} />
            <meshLambertMaterial color={"#7a7aff"} />
          </mesh>
          <ShaderPlaneMesh />
        </group>
        <GridFloor
          i={36 * 3}
          j={18 * 3}
          setHeightViewPort={setHeightViewPort}
          position={[0, -0.0111, 0]}
          scale={[10 / (36 * 3), 1 / (2 * 3), 10 / (36 * 3)]}
        />

        {boxesMemo}
        {/*  */}
      </Canvas>
    </>
  );
};

export default App3D;
