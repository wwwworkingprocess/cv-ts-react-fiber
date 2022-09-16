import { useMemo, useRef } from "react";

import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  Color,
  LinearMipmapLinearFilter,
  LinearMipMapLinearFilter,
  ShaderChunk,
  ShaderMaterial,
  Texture,
  UniformsLib,
  UniformsUtils,
} from "three";

const shaders = {
  uniforms: {
    foo: {
      type: "f",
      value: 0.5,
    },
  },
  vertexShader: `
        uniform float foo;

        uniform float uTime;   // time (float)

        uniform sampler2D bumpTexture;  // A uniform to contain the heightmap image
        uniform float bumpScale;    // A uniform to contain the scaling constant
        uniform float bumpLinear;   // reduce value of bump 
        uniform sampler2D normalTexture;   // reduce value of bump 
        

        varying float vAmount; // A variable to store the height of the point
        varying vec2 vUV; // The UV mapping coordinates of a vertex
    
        ${ShaderChunk["common"]}
        ${ShaderChunk["shadowmap_pars_vertex"]}
      void main() 
      {
        // The "coordinates" in UV mapping representation
        vUV = uv;

        // The heightmap data at those coordinates
        vec4 bumpData = texture(bumpTexture, uv);
        vec4 normalData = texture(normalTexture, uv);
        

        // height map is grayscale, so it doesn't matter if you use r, g, or b.
        // vAmount = bumpData.r > 0.1 ? bumpData.r : uTime; //  bumpData.r + uTime; //  > bumpLinear ? bumpData.r : uTime;
        vAmount = bumpData.r + uTime;

        // move the position along the normal
        // vec3 newPosition = position + normal * bumpScale * vAmount;
        // vec3 newPosition = position + normalData.xyz * bumpScale * vAmount;
        vec3 newPosition = position + normal *  vAmount * bumpScale;


        
        // vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
        // vLightDir = mat3(viewMatrix) * (lightPosition - vWorldPosition);

        // Compute the position of the vertex using a standard formula
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

        // vec4 worldPosition = vec4(newPosition, 1.0);
        vec4 worldPosition = modelViewMatrix * vec4(newPosition, 1.0);
        
        vec3 objectNormal = vec3( normal );
        vec3 transformedNormal = normalMatrix * objectNormal;


        ${ShaderChunk["shadowmap_vertex"]}
      }
      `,

  fragmentShader: `
  ${ShaderChunk["common"]}
  ${ShaderChunk["packing"]}
  
  uniform sampler2D uTexture;

      uniform float foo;
      varying vec2 vUV;
      varying float vAmount;
      
      ${ShaderChunk["shadowmap_pars_fragment"]}
      
      

      void main()
      {
        
           vec4 texture = texture2D(uTexture, vUV);

          gl_FragColor = vAmount > 0.0 ? vec4(texture.r, texture.g, texture.b, 1.0) : vec4(0, 0, 0, 0.0);
        }
        `,
};
//
// ${ShaderChunk["shadowmap_fragment"]}   <-- missing from three :-(

export const MyShaderMaterial = (props: any) => {
  //function MyShaderMaterial(props: any) {
  const { heightMap, tex, normTex } = props;
  //
  const ref = useRef<ShaderMaterial>(null!);
  const uniforms = useMemo(
    () =>
      UniformsUtils.merge([
        UniformsLib.lights,
        shaders.uniforms,
        {
          receiveShadow: { value: true },
          // Feed the heightmap
          uTime: { value: 0.0 },
          uTexture: { value: tex },
          bumpTexture: { value: heightMap },
          normalTexture: { value: normTex },
          // Feed the scaling constant for the heightmap
          bumpLinear: { value: 0.02 },
          bumpScale: { value: 0.23 },
        },
      ]),
    [heightMap, tex, normTex]
  );

  useFrame((state) => {
    ref.current.uniforms.uTime.value =
      -0.0518 + 0.03 * (1 - Math.sin(state.clock.elapsedTime * 0.2));
    ref.current.uniformsNeedUpdate = true;
  });
  //
  return (
    <shaderMaterial
      ref={ref}
      attach="material"
      uniforms={uniforms}
      vertexShader={shaders.vertexShader}
      fragmentShader={shaders.fragmentShader}
      lights={true}
      transparent={true}
    />
  );
};

export function ShaderPlaneMesh() {
  const heightMap = useTexture(
    "/data/earth/bump.jpg",
    (tx: Texture | Texture[]) => {
      const t = tx as Texture;
      //
      t.generateMipmaps = true;
      t.minFilter = LinearMipMapLinearFilter;
      t.magFilter = LinearMipMapLinearFilter;
    }
  );
  const tex = useTexture("./data/earth/3_no_ice_clouds_8k.jpg");
  const specular = useTexture("./data/earth/specular.jpg");
  const normTex = useTexture(
    "./data/earth/normal3.png",
    (tx: Texture | Texture[]) => {
      const t = tx as Texture;
      //
      t.minFilter = LinearMipmapLinearFilter;
      t.magFilter = LinearMipmapLinearFilter;
    }
  ); // lo-res

  // const shaderPropsMemo = useMemo(
  //   () =>
  //     !heightMap || !tex || !normTex ? undefined : { heightMap, tex, normTex },
  //   [tex, normTex, heightMap]
  // );
  //

  return (
    <mesh receiveShadow castShadow position={[0, 0, 0.011]}>
      <planeBufferGeometry attach="geometry" args={[10, 5, 1000, 500]} />
      <meshPhongMaterial
        map={tex}
        normalMap={normTex}
        displacementMap={heightMap}
        specular={new Color(0x111111)}
        specularMap={specular}
        displacementScale={0.215155}
      />

      {/* {shaderPropsMemo ? <MyShaderMaterial {...shaderPropsMemo} /> : <></>} */}
    </mesh>
  );
}
