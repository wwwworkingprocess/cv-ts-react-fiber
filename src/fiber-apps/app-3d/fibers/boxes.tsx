import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import {
  BoxBufferGeometry,
  BufferGeometry,
  Color,
  InstancedMesh,
  Material,
  MeshStandardMaterial,
  Object3D,
} from "three";

const o3d = new Object3D();

const updateInstanceAtIndex = (
  instancedMesh: InstancedMesh<BufferGeometry, Material | Material[]>,
  idx: number,
  time: number,
  x: number,
  z: number,
  i: number,
  j: number,
  baseColor: Color
): void => {
  const [a, b] = [x / i, z / j]; // offset input
  //
  const sinT = Math.sin((time / Math.PI) * a * b);
  //
  const diffByT = 0.01 + (sinT + 0.8) * 0.042;
  o3d.position.set(i / 2 - x, -0.29 / 2 + 0.041 + diffByT * 1.41, j / 2 - z);
  o3d.rotation.y = time * 0.02;
  o3d.updateMatrix();
  //
  instancedMesh.setMatrixAt(idx, o3d.matrix);
  //
  instancedMesh.setColorAt(
    idx,
    new Color(
      0.2 * Math.abs(1 - Math.cos(time * 1000 * x)) * baseColor.r,
      ((0.9 * (Math.abs(Math.sin(time)) * 1 + 0.1)) / (z + 1)) * baseColor.g,
      0.2 * Math.abs(Math.cos(time)) * baseColor.b
    )
  );
};

const Boxes = (
  props: JSX.IntrinsicElements["instancedMesh"] & {
    i: number;
    j: number;
    baseColor: Color;
    //   i,
    //   j,
    //   baseColor,
  }
) => {
  const { i, j, baseColor } = props;
  //
  const ref = useRef<InstancedMesh>(null!);
  //
  const material = new MeshStandardMaterial();
  const boxesGeometry = new BoxBufferGeometry(0.05, 0.29, 0.05);
  //
  useFrame(({ clock }) => {
    if (ref.current) {
      let counter = 0;
      const t = clock.oldTime * 0.0051;
      //
      for (let x = 0; x < i; x++) {
        for (let z = 0; z < j; z++) {
          const id = counter++; // first index is 1, not 0
          //
          updateInstanceAtIndex(ref.current, id, t, x, z, i, j, baseColor);
        }
      }
      //
      ref.current.instanceMatrix.needsUpdate = true;
    }
  });
  //
  return (
    <instancedMesh
      castShadow
      ref={ref}
      args={[boxesGeometry, material, i * j]}
      {...props}
    />
  );
};

export default Boxes;
