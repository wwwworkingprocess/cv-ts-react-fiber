import { useEffect, useState, useRef } from "react";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, RoundedBox } from "@react-three/drei";

import { Dice } from "./three-components/dice/dice.component";
import MyText from "./three-components/tree-3d/text-3d.component";
import {
  BoxBufferGeometry,
  Color,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedMesh,
  MeshLambertMaterial,
  MeshStandardMaterial,
  Object3D,
  Shape,
} from "three";

const tempBoxes = new Object3D();

const Boxes = ({ i, j }: { i: number; j: number }) => {
  const material = new MeshStandardMaterial({
    color: new Color(Math.random(), Math.random(), Math.random()),
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
          tempBoxes.position.set(i / 2 - x, id % 10, j / 2 - z);
          tempBoxes.rotation.y = t;
          tempBoxes.updateMatrix();
          ref.current.setMatrixAt(id, tempBoxes.matrix);
          // ref.current.setColorAt(
          //   id,
          //   new Color(
          //     Math.random(),
          //     Math.random() * (i + 1),
          //     Math.random() * (j + 1)
          //   )
          // );
        }
      }
      ref.current.instanceMatrix.needsUpdate = true;
    }
  });

  return <instancedMesh ref={ref} args={[boxesGeometry, material, i * j]} />;
};

const roundedRect = (width: number, height: number, radius: number) => {
  const shape = new Shape();
  //
  shape.moveTo(-(width / 2), -(height / 2) + radius);
  //
  shape.lineTo(-(width / 2), height / 2 - radius);
  shape.quadraticCurveTo(
    -(width / 2),
    height / 2,
    -(width / 2) + radius,
    height / 2
  );
  //
  shape.lineTo(width / 2 - radius, height / 2);
  shape.quadraticCurveTo(width / 2, height / 2, width / 2, height / 2 - radius);
  //
  shape.lineTo(width / 2, -(height / 2) + radius);
  shape.quadraticCurveTo(
    width / 2,
    -(height / 2),
    width / 2 - radius,
    -(height / 2)
  );
  //
  shape.lineTo(-(width / 2) + radius, -(height / 2));
  shape.quadraticCurveTo(
    -(width / 2),
    -(height / 2),
    -(width / 2),
    -(height / 2) + radius
  );
  //
  return shape;
};

const App3D = (props: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { setIsOpen } = props;

  const [scale, setScale] = useState<number>(2);
  //
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
          <shapeGeometry args={[roundedRect(2.5, 5, 0.2)]} />
          <meshBasicMaterial color="red" side={DoubleSide} />
        </mesh>

        <Dice />

        <MyText
          position={[0, 10, 0]}
          // color="black"
          // anchorX="center"
          // anchorY="middle"
          // onClick={(e) => console.log("clicked text")}
        >
          Hello Text 3D!
        </MyText>
        {/* 
        <RoundedBox
          args={[1, 1, 1]}
          position={[1, 1, -2]}
          radius={0.25}
          smoothness={4}
        >
          <meshPhongMaterial color="#33f3f3" wireframe />
        </RoundedBox> */}

        <Boxes i={128} j={128} />
      </Canvas>
    </>
  );
};

export default App3D;
