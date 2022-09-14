import { PointLightProps, SpotLightProps } from "@react-three/fiber";

const defaultShadowProps = {
  "shadow-mapSize-height": 512,
  "shadow-mapSize-width": 512,
};

const spotProps = {
  position: [10, 20, 10],
  angle: 0.15,
  penumbra: 1,
} as SpotLightProps;

const pointProps = {
  position: [10, 10, 10],
  intensity: 0.5,
} as PointLightProps;

const DefaultLightRig = ({ castShadow }: { castShadow?: boolean }) => (
  <>
    <spotLight {...spotProps} />
    <pointLight
      castShadow={castShadow}
      {...pointProps}
      {...(castShadow ? defaultShadowProps : {})}
    />
  </>
);

export default DefaultLightRig;
