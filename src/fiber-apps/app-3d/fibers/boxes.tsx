import { useRef } from "react";

import { useFrame } from "@react-three/fiber";

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
  baseColor: Color,
  country: any
): void => {
  const [a, b] = [x / i, z / j]; // offset input
  //
  const newX = !country ? i / 2 - x : country.coords[0] * 0.1;
  const newZ = !country ? j / 2 - z : country.coords[1] * -0.1;
  //
  const sinT = Math.sin((time / Math.PI) * a * b);
  //
  const diffByT = 0.01 + (sinT + 0.8) * 0.042;
  o3d.position.set(newX, -0.29 / 2 + 0.041 + diffByT * 1.41, newZ);
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
    countries?: Array<any>;
  }
) => {
  const { countries, i, j, baseColor } = props;
  //
  const hasCountries = countries && countries.length > 0;
  const count = hasCountries ? countries.length : i * j;

  const ref = useRef<InstancedMesh>(null!);
  //
  const material = new MeshStandardMaterial();
  const boxesGeometry = new BoxBufferGeometry(0.05, 0.26, 0.05);
  //const boxesGeometry = new BoxBufferGeometry(0.25, 0.29, 0.25);
  //
  useFrame(({ clock }) => {
    if (ref.current) {
      let counter = 0;
      const t = clock.oldTime * 0.0051;
      //
      for (let x = 0; x < i; x++) {
        for (let z = 0; z < j; z++) {
          const country = hasCountries ? countries[counter] : undefined;
          const id = counter++; // first index is 1, not 0
          //
          updateInstanceAtIndex(
            ref.current,
            id,
            t,
            x,
            z,
            i,
            j,
            baseColor,
            country
          );
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
      args={[boxesGeometry, material, count]}
      {...props}
    />
  );
};

export default Boxes;
