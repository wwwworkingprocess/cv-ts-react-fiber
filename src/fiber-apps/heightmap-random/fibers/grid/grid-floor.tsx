import { Billboard, Text } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
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
import GridFloorCells from "./grid-floor-cells";

const tempBoxes = new Object3D();

const tempColor = new Color();
const data = Array.from({ length: 1000 }, () => ({
  color: ["#72aac6", "#72aac6", "#72aac6", "#72aac6", "#72aac6"][
    Math.floor(Math.random() * 5)
  ],
  scale: 1,
}));

const GridFloor = (
  props: JSX.IntrinsicElements["group"] & {
    i: number;
    j: number;
    idx?: number; // integer, z-depth
    baseColor: Color;
  }
) => {
  const { i, j, idx, baseColor } = props;
  //
  const ref = useRef<InstancedMesh>(null!);
  const prevRef = useRef<number | undefined>(); // instanceID
  const zShift = (idx ?? 0) * 1;

  const [hoveredId, setHoveredId] = useState<number | undefined>();
  const crossHairHeight = 0.75;
  const [crossHairPosition, setCrossHairPosition] = useState<Vector3>();

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
          //
          const id = z * i + x;
          //
          tempBoxes.position.set(i * 0.5 - x - 0.5, 0, j * 0.5 - z - 0.5);
          tempBoxes.position.y =
            id === hoveredId ? Math.sin(t) * 0.065 + 0.065 : 0;
          //
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
  // console.log("creating", { i, j, n: i * j }, "tiles");
  //
  return (
    <group {...props}>
      {/* TODO: check usePivot on mesh and bind value via Three.js */}

      {crossHairPosition && (
        <mesh position={crossHairPosition}>
          <boxGeometry
            attach={"geometry"}
            args={[0.95, crossHairHeight, 0.95]}
          />
          <meshPhongMaterial
            attach={"material"}
            color={"blue"}
            side={DoubleSide}
            opacity={0.15}
            transparent={true}
          />
          <Billboard>
            <Text
              fontSize={0.15}
              position={[0, crossHairHeight * 0.75, 0]}
              fillOpacity={1}
            >
              {crossHairPosition
                ? JSON.stringify([
                    crossHairPosition.x,
                    /*crossHairPosition.y +*/ zShift,
                    crossHairPosition.z,
                  ])
                : ""}
            </Text>
          </Billboard>
        </mesh>
      )}
      <GridFloorCells
        i={i}
        j={j}
        baseColor={new Color(0.1, 0.4, 0.4)}
        setCrossHairPosition={setCrossHairPosition}
      />
    </group>
  );
};

export default GridFloor;
