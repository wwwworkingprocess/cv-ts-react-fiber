import { ThreeEvent, useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Color,
  DoubleSide,
  ImageLoader,
  Mesh,
  Raycaster,
  ShaderMaterial,
  TextureLoader,
  UniformsLib,
  UniformsUtils,
  Vector2,
} from "three";

export const cover = `
  vec2 getCoverUv (vec2 uv, vec2 resolution, vec2 texResolution) {
    vec2 s = resolution; // Screen
    vec2 i = texResolution; // Image
    float rs = s.x / s.y;
    float ri = i.x / i.y;
    vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
    vec2 offset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
    vec2 coverUv = uv * s / new + offset;
    return coverUv;
  }
`;

const circle = `
  float circle(in vec2 st, in float r, vec2 pos){
    float dist = distance(st, pos);
    return 1.0 - smoothstep(r-r*0.001, r+r*0.001, dist);
  }
  float circle(in vec2 st, in float r){
    float dist = distance(st, vec2(0.5));
    return 1.0 - smoothstep(r-r*0.001, r+r*0.001, dist);
  }
`;
// ${circle}   ${map}   ${noise}
const fragmentShader = `
  uniform vec3 uColor;
  uniform vec2 uPlaneSize;
  uniform vec2 uImageSize;
  uniform vec2 uMousePos;
  uniform float uMouseRadius;
  uniform float uTime;
  uniform sampler2D uTexture;
  uniform float uSpikes;
  uniform float uRadius;
  
  varying vec2 vUv;

  ${cover}
  ${circle}
  

  void main() {
    float mouseRadius = uMouseRadius;
    vec2 uv = vUv;
    vec2 coverUv = getCoverUv(uv, uPlaneSize, uImageSize);

    // apply image texture
    vec4 texture = texture2D(uTexture, coverUv);
    vec4 color = texture;
    
    float radius = 0.3;
    float mask = circle(uv, radius);
    color.a = mask;

    // vec3 cursorColor = mix(color.rgb, uColor, circle(uv, mouseRadius, uMousePos));
    // color = vec4(cursorColor, 1.0);

    vec2 moving_point =  vec2(
      0.5 * (sin(uTime) + 1.0),
      0.5 * (cos(uTime) + 1.0)
    );
    
    if ( abs(coverUv.x - uMousePos.x) < 0.02 && abs(coverUv.y - uMousePos.y) < 0.02 ) { 
      gl_FragColor = vec4(255,0,0,1);
    } else {
      gl_FragColor = color;
    }
    
  }
`;

const vertexShader = ` 
  varying vec2 vUv;
  void main() {
    // pass uv coords into fragment shader
    vUv = uv;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

//
// const IMG_SRC = "./logo512.png";
const IMG_SRC = "./data/earth/3_no_ice_clouds_8k.jpg";

const ImagePlane = (
  props: JSX.IntrinsicElements["mesh"] & {
    planeSize: number;
    // setIsOpen: any;
    // onNavigate: () => void;
    // tooltipText: string;
  }
) => {
  const { planeSize } = props;
  const ref = useRef<Mesh>(null!);
  const shaderRef = useRef<ShaderMaterial>(null!);

  //
  const tex = useLoader(TextureLoader, IMG_SRC);
  const img = useLoader(ImageLoader, IMG_SRC);
  //
  const raycaster = new Raycaster();

  const PLANE_SIZE = planeSize || 4.0;
  const speed = {
    value: 0.006,
  };
  const tilt = {
    x: 0,
    y: 0,
  };

  let mouse = useRef<Vector2 | null>(null);

  //
  // track mouse movement
  //
  const updateMousePosition = (e: ThreeEvent<PointerEvent>) => {
    const v2 = new Vector2(
      e.uv?.x ?? 0,
      e.uv?.y ?? 0
      // (e.clientX / window.innerWidth) * 2 - 1,
      // -(e.clientY / window.innerHeight) * 2 + 1
    );
    console.log("pointer track", v2);
    //
    mouse.current = v2;
    //
  };

  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame((state, delta) => {
    const { camera, scene, clock } = state;
    //
    // get mouse pos
    if (mouse.current) {
      const t = clock.getElapsedTime();
      //
      const point = new Vector2(
        // intersects[0]?.uv?.x, intersects[0]?.uv?.y
        0.5 * (Math.sin(t) + 1),
        0.5 * (Math.cos(t) + 1)
      );

      // (ref.current.material as any).uniforms.uMousePos.value = point;
      // gsap.to(ref.current.material.uniforms.uMouseRadius, {
      //   value: 0.2,
      //   duration: 0.4,
      //   overwrite: true,
      // });
      /*
      (ref.current.material as any).current.uniforms.uTime.value = t;
      if (shaderRef.current) {
        //  console.log("new uniform", point);
        shaderRef.current.uniforms.uMousePos = { value: point };
        // shaderRef.current.uniforms.uMousePos.value = point;
        shaderRef.current.uniformsNeedUpdate = true;
        // shaderRef.current.needsUpdate = true;
      }
      */
      /*
      raycaster.setFromCamera(mouse.current, camera);
      const intersects = raycaster.intersectObjects([ref.current]);
      if (intersects) {
        const point = new Vector2(
          // intersects[0]?.uv?.x, intersects[0]?.uv?.y
          0.5 * (Math.sin(t) + 1),
          0.5 * (Math.cos(t) + 1)
        );

        // (ref.current.material as any).uniforms.uMousePos.value = point;
        // gsap.to(ref.current.material.uniforms.uMouseRadius, {
        //   value: 0.2,
        //   duration: 0.4,
        //   overwrite: true,
        // });
        if (shaderRef.current) {
          //  console.log("new uniform", point);
          shaderRef.current.uniforms.uMousePos.value = point;
          // shaderRef.current.needsUpdate = true;
        }
      }
      */
    }
    // (ref.current.rotation.x += hovered ? 0.01 : 0)
  });

  const uniforms = useMemo(
    () =>
      UniformsUtils.merge([
        UniformsLib.lights,
        {
          uColor: { value: new Color("lightskyblue") },
          uPlaneSize: { value: new Vector2(PLANE_SIZE, PLANE_SIZE) },
          uImageSize: {
            value: new Vector2(
              (img as any).width ?? 1300,
              (img as any).height ?? 200
            ),
          },
          // uMousePos: { value: new Vector2(0.5, 0.5) },
          uMousePos: { value: new Vector2(0.5, Math.random()) },

          uMouseRadius: { value: 10.0 },
          uTime: { value: 0.0 },
          uRadius: { value: 0.5 },
          uTexture: { value: tex },
          uSpikes: { value: 1.5 }, // adjust the waviness
        },
      ]),
    []
  );
  //

  return (
    <mesh
      // onPointerMove={updateMousePosition}
      ref={ref}
      // onPointerEnter={handlePointerEnter}
      // onPointerMove={handlePointerMove}
      // onPointerLeave={handlePointerLeave}
      {...props}
    >
      <planeBufferGeometry args={[PLANE_SIZE, PLANE_SIZE, 1, 1]} />
      {/* <circleGeometry args={[2.5, 128, 128]} /> */}
      <shaderMaterial
        attach="material"
        ref={shaderRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        // wireframe={true}
        side={DoubleSide}
      />
    </mesh>
  );
};

export default ImagePlane;
