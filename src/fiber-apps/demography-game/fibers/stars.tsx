import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BackSide, Mesh, ShaderMaterial, Vector2 } from "three";

type StarsOwnProps = {
  mutableRef: React.MutableRefObject<Mesh<any, any>>;
};

const Stars = (props: JSX.IntrinsicElements["mesh"] & StarsOwnProps) => {
  const { mutableRef, ...meshProps } = props;
  //
  const materialRef = useRef<ShaderMaterial>(null!);
  //
  const uniforms = useMemo(
    () => ({
      iTime: { value: 0.0 },
      iResolution: { value: new Vector2(1200, 1200) },
      iMouse: { value: new Vector2(0, 200) },
    }),
    []
  );
  //
  useFrame(({ clock }) => {
    materialRef.current.uniforms.iTime.value = clock.getElapsedTime() * 0.125;
  });
  //
  return (
    <mesh ref={mutableRef} {...meshProps}>
      <sphereBufferGeometry attach="geometry" args={[200, 200, 20, 20]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertex_shader}
        fragmentShader={fragment_shader}
        uniforms={uniforms}
        side={BackSide}
      />
    </mesh>
  );
};

export default Stars;

/**
 *  Star Nest by Pablo Roman Andrioli
 *
 *  @param {float}  iTime time passed since application started in seconds
 *  @param {vec2(float)}  iResolution resolution of canvas
 *  @param {vec2(float)}  iMouse mouse position
 **/
const fragment_shader: string = `
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;

varying vec3 vWorldPosition;
varying vec2 vUv;

#define iterations 17
#define formuparam 0.53

#define volsteps 20
#define stepsize 0.1

#define zoom   0.800
#define tile   0.850
#define speed  0.00010 

#define brightness 0.0015
#define darkmatter 0.300
#define distfading 0.730
#define saturation 0.850

void main() {
    vec2 uv = vec2(vUv.y, -vUv.x); //get coords and direction
    vec3 dir = vec3(uv*zoom,1.0);
    //
    float time= iTime * speed + 0.25;
    //
    // mouse rotation
    //
    float a1=.5+iMouse.x/iResolution.x*2.0;
    float a2=.8+iMouse.y/iResolution.y*2.0;
    //
    mat2 rot1 = mat2(cos(a1),sin(a1),-sin(a1),cos(a1));
    mat2 rot2 = mat2(cos(a2),sin(a2),-sin(a2),cos(a2));
    dir.xz *= rot1;
    dir.xy *= rot2;
    //
    vec3 from = vec3(1.0,0.5,0.5);
    from += vec3(time*2.0,time,-2.0);
    from.xz *= rot1;
    from.xy *= rot2;
    //
    // volumetric rendering
    //
    float s = 0.1, fade = 1.0;
    //
    vec3 v = vec3(0.0);
    //
    for (int r = 0; r < volsteps; r++) {
      vec3 p = from + s * dir * 0.5;
      //
      p = abs(vec3(tile)-mod(p,vec3(tile*2.0))); // tiling fold
      float pa,a=pa=0.0;
      //
      for (int i=0; i<iterations; i++) { 
        p = abs(p)/dot(p,p)-formuparam; // the magic formula
        a += abs(length(p)-pa); // absolute sum of average change
        pa = length(p);
      }
      //
      float dm = max(0.0,darkmatter-a*a*0.001); //dark matter
      //
      a *= a*a; // add contrast
      //
      if (r>6) fade *= 1.0-dm; // dark matter, don't render near
      //
      // coloring based on distance
      //
      v += vec3(dm,dm*.5,0.);
      v += fade;
      v += vec3(s,s*s,s*s*s*s) * a * brightness * fade;
      //
      fade *= distfading; // distance fading
      //
      s += stepsize;
    }
    //
    v = mix(vec3(length(v)),v,saturation); //color adjust
    vec4 fragColor = vec4(v*.01,1.);	
    //
    gl_FragColor = fragColor;
  }
`;

const vertex_shader: string = `
varying vec3 vWorldPosition;
varying vec2 vUv;

void main() {
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    //
    vUv = uv;
    vWorldPosition = worldPosition.xyz;
    //
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;
