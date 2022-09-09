import { Billboard, Text } from "@react-three/drei";
import { InstancedMeshProps, ThreeEvent, useFrame } from "@react-three/fiber";
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
  DoubleSide,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from "three";

const tempBoxes = new Object3D();

// const tempObject = new Object3D();
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
  const { i, j, idx, baseColor, setCrossHairPosition } = props;
  //
  const material = new MeshStandardMaterial({
    color: baseColor,
  });

  const ref = useRef<InstancedMesh>(null!);
  const prevRef = useRef<number | undefined>(); // instanceID
  const zShift = (idx ?? 0) * 1;

  const [hoveredId, setHoveredId] = useState<number | undefined>();
  const crossHairHeight = 0.75;
  // const [crossHairPosition, setCrossHairPosition] = useState<Vector3>();

  useEffect(() => {
    if (prevRef && prevRef.current) {
      prevRef.current = hoveredId;
    }
  }, [hoveredId]);

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.oldTime * 0.0001;
      //
      // instances are positioned on the xz plane
      //
      for (let x = 0; x < i; x++) {
        for (let z = 0; z < j; z++) {
          // const id = counter++;
          const id = z * i + x;
          tempBoxes.position.set(i * 0.5 - x - 0.5, 0, j * 0.5 - z - 0.5);
          tempBoxes.position.y =
            id === hoveredId ? Math.sin(t) * 0.065 + 0.065 : 0;
          // tempBoxes.rotation.y = t;
          tempBoxes.updateMatrix();
          ref.current.setMatrixAt(id, tempBoxes.matrix);
          //
          //
          // highlighting hovered instance
          //
          if (hoveredId !== prevRef.current) {
            (id === hoveredId
              ? tempColor.setRGB(10, 10, 10)
              : tempColor.set(data[id].color)
            ).toArray(colorArray, id * 3);
            //
            ref.current.geometry.attributes.color.needsUpdate = true;
          }
        }
      }
      //
      ref.current.instanceMatrix.needsUpdate = true;
    }
  });

  const colorArray = useMemo(
    () =>
      Float32Array.from(
        new Array(1000)
          .fill(0)
          .flatMap((_, i) => tempColor.set(data[i].color).toArray())
      ),
    []
  );

  const geometryRef = useRef<BoxGeometry>(null!);

  useLayoutEffect(() => {
    geometryRef.current && geometryRef.current.translate(0, -0.02, 0);
  }, []);

  //

  const onPointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();

      // const id = x * i + z;
      const MODULO_BASE = i; // 9; // todo inherit j
      const id = e.instanceId ?? 0;
      const x = id % MODULO_BASE;
      const z = (id - x) / MODULO_BASE;
      //
      // console.log("new crosshair pos", { x, z, i, j, id });
      //
      const shift_y = crossHairHeight * 0.5;
      //
      const newPoint = new Vector3(
        i * 0.5 - x - 0.5,
        0 + shift_y,
        j * 0.5 - z - 0.5
      );

      //setCrossHairPosition(e.point);
      setCrossHairPosition(newPoint);
      setHoveredId(e.instanceId);
    },
    [i, j, setCrossHairPosition]
  );
  //
  //

  useEffect(() => {
    const timeoutId = setTimeout(() => setCrossHairPosition(undefined), 3000);
    //
    return () => timeoutId && clearTimeout(timeoutId);
  }, [hoveredId, setCrossHairPosition]);

  return (
    <instancedMesh
      ref={ref}
      args={[geometryRef.current, material, i * j]}
      onClick={(e) => {
        console.log("clicked", e.instanceId, e.object.userData);
      }}
      onPointerMove={onPointerMove}
      onPointerOut={(e) => {
        setHoveredId(undefined);
        setCrossHairPosition(undefined);
      }}
    >
      <boxGeometry
        attach="geometry"
        args={[0.95, 0.04, 0.95]}
        ref={geometryRef}
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
