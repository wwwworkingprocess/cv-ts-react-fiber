import React, { useRef } from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader.js";

export const Dice = () => {
  const mesh = useRef<THREE.Mesh>(null!);
  //
  const textures = useLoader(
    TextureLoader,
    [1, 2, 3, 4, 5, 6].map((n) => `data/dice/dice_${n}.jpg`)
  );

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
