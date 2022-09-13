import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  BoxGeometry,
  Color,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from "three";
import { ThreeEvent, useFrame } from "@react-three/fiber";

const tempBoxes = new Object3D();
const tempColor = new Color();
const data = Array.from({ length: 1000 }, () => ({
  color: ["#72aac6", "#72aac6", "#72aac6", "#72aac6", "#72aac6"][
    Math.floor(Math.random() * 5)
  ],
  scale: 1,
}));

const GridFloorCells = (
  props: JSX.IntrinsicElements["instancedMesh"] & {
    i: number;
    j: number;
    idx?: number; // integer, z-depth
    baseColor: Color;
    setCrossHairPosition: React.Dispatch<
      React.SetStateAction<Vector3 | undefined>
    >;
  }
) => {
  const { i, j, baseColor, setCrossHairPosition } = props;
  //
  const material = new MeshStandardMaterial({ color: baseColor });

  const crossHairHeight = 0.75;
  const shiftCrosshairY = crossHairHeight * 0.5;
  const instanceCount = i * j;

  const [hoveredId, setHoveredId] = useState<number | undefined>();
  const prevRef = useRef<number | undefined>(); // instanceID
  const ref = useRef<InstancedMesh>(null!);
  const geometryRef = useRef<BoxGeometry>(null!);

  useEffect(() => {
    if (prevRef && prevRef.current) prevRef.current = hoveredId;
  }, [hoveredId]);

  const colorArray = useMemo(
    () =>
      Float32Array.from(
        new Array(instanceCount ?? 10000)
          .fill(0)
          .flatMap((_, i) => tempColor.set("#72aac6").toArray())
      ),
    [instanceCount]
  );

  const getGridPointById = (id: number) => {
    const x = id % i;
    const z = (id - x) / i;
    //
    return [x, z];
  };
  //
  // assuming xz plane is 1x1 and 'height' is (shiftCrosshairY*2)
  //
  const getCellCenterPointById = useCallback(
    (id: number): Vector3 => {
      //
      // const id = x * i + z;
      //
      const x = id % i;
      const z = (id - x) / i;
      //
      const newPoint = new Vector3(
        i * 0.5 - x - 0.5,
        0 + shiftCrosshairY,
        j * 0.5 - z - 0.5
      );
      //
      return newPoint;
    },
    [i, j, shiftCrosshairY]
  );

  //
  // translate floor before first render
  //
  useLayoutEffect(() => {
    geometryRef.current && geometryRef.current.translate(0, -0.02, 0);
  }, []);

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    //
    if (e.instanceId) {
      const gp = getGridPointById(e.instanceId);
      //
      console.info("clicked", e.instanceId, e.object.userData, gp);
    }
  };

  //
  // reset selection when leaving a cell
  //
  const onPointerOut = (e: ThreeEvent<PointerEvent>) => {
    setHoveredId(undefined);
    setCrossHairPosition(undefined);
  };

  //
  // move crosshair to cell and set selected instanceId
  //
  const onPointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      //
      if (e.instanceId) {
        if (hoveredId !== e.instanceId) {
          const newPoint = getCellCenterPointById(e.instanceId);
          //
          setCrossHairPosition((prev) => (prev === newPoint ? prev : newPoint));
          setHoveredId(e.instanceId);
        }
      }
    },
    [hoveredId, setCrossHairPosition, getCellCenterPointById]
  );

  //
  // automaticaly remove selection after 3 seconds
  //
  useEffect(() => {
    const timeoutId = setTimeout(() => setCrossHairPosition(undefined), 3000);
    //
    return () => timeoutId && clearTimeout(timeoutId);
  }, [setCrossHairPosition]);

  //
  // set the position & color on render
  //
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.oldTime * 0.0001;
      const sinT = Math.sin(t);
      const [posY, posHoverY] = [0, sinT * 0.065 + 0.065];

      //
      // instances are positioned on the xz plane
      //
      for (let x = 0; x < i; x++) {
        for (let z = 0; z < j; z++) {
          const id = z * i + x;
          //
          tempBoxes.position.set(i * 0.5 - x - 0.5, 0, j * 0.5 - z - 0.5);
          tempBoxes.position.y = id === hoveredId ? posHoverY : posY;
          //
          tempBoxes.updateMatrix();
          //
          ref.current.setMatrixAt(id, tempBoxes.matrix); // reposition vertex
          //
          // highlighting hovered instance
          //
          if (hoveredId !== prevRef.current) {
            (id === hoveredId
              ? tempColor.setRGB(10, 10, 10)
              : tempColor.set("#72aac6")
            ) /// .set(data[id].color)
              .toArray(colorArray, id * 3);
            //
            ref.current.geometry.attributes.color.needsUpdate = true;
          }
        }
      }
      //
      ref.current.instanceMatrix.needsUpdate = true;
    }
  });

  //
  //
  //
  return (
    <instancedMesh
      ref={ref}
      args={[geometryRef.current, material, instanceCount]}
      onClick={onClick}
      onPointerMove={onPointerMove}
      onPointerOut={onPointerOut}
    >
      <boxGeometry
        ref={geometryRef}
        attach="geometry"
        args={[0.95, 0.04, 0.95]}
      >
        <instancedBufferAttribute
          attach="attributes-color"
          args={[colorArray, 3]}
        />
      </boxGeometry>
      <meshBasicMaterial attach="material" toneMapped={false} vertexColors />
    </instancedMesh>
  );
};

export default GridFloorCells;
