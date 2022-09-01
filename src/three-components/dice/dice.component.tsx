import React, { useRef, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader.js";

export const Dice = () => {
  const mesh = useRef<THREE.Mesh>(null!);
  //
  const textures = useLoader(
    TextureLoader,
    [1, 2, 3, 4, 5, 6].map((n) => `data/dice/dice_${n}.jpg`)
  );
  //
  //   useFrame(() => {
  //     if (mesh.current) {
  //       const m = mesh.current as THREE.Mesh;
  //       m.rotation.x = m.rotation.y += 0.01;
  //     }
  //   });
  //
  return (
    <mesh ref={mesh} onContextMenu={(e) => console.log("context menu")}>
      <boxBufferGeometry attach="geometry" />
      {textures.map((texture, idx) => (
        <meshBasicMaterial
          key={texture.id}
          attach={`material-${idx}`}
          map={texture}
        />
      ))}
    </mesh>
  );
};

// export default function App() {
//   return (
//     <Canvas>
//       <ambientLight intensity={0.5} />
//       <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
//       <pointLight position={[-10, -10, -10]} />
//       <Suspense fallback={null}>
//         <Box />
//       </Suspense>
//     </Canvas>
//   );
// }
