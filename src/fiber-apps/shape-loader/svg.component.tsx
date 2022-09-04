import React, { Suspense, useMemo, memo } from "react";
import { Box, Center, useHelper } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import {
  SVGLoader,
  SVGResultPaths,
} from "three/examples/jsm/loaders/SVGLoader";
import { Box3Helper, Color, DoubleSide, Shape } from "three";

/*
    Offseting SVG polygons by index
    The paths from SVGLoader Z-fight.
    This fix causes stacking problems with detailed SVGs.
*/
// const POLYGON_OFFSET_FACTOR = 0.1;
const POLYGON_OFFSET_FACTOR = 0.5;

const DefaultModel = () => (
  <Box args={[1, 1, 1]}>
    <meshBasicMaterial attach="material" color="silver" />
  </Box>
);

const SvgShape = ({
  shape,
  color,
  index,
}: {
  shape: Shape;
  color: Color;
  index: number;
}) => (
  <mesh position={[0, 0, index * POLYGON_OFFSET_FACTOR]}>
    <meshLambertMaterial
      attach="material"
      side={DoubleSide}
      color={color}
      polygonOffset
      polygonOffsetFactor={0 - index * POLYGON_OFFSET_FACTOR + index}
    />
    <shapeBufferGeometry attach="geometry" args={[shape]} />
  </mesh>
);

const SvgAsync = memo(
  (
    props: //     {
    //     url,
    //     sceneRef,
    //   }: // scale,
    JSX.IntrinsicElements["mesh"] & {
      url: string;
      sceneRef?: any;
      // scale?: Vector3 | undefined;
    }
  ) => {
    const { url, sceneRef } = props;
    //
    const { paths } = useLoader(SVGLoader, url);
    //
    const shapes = useMemo(
      () =>
        paths.flatMap((path: SVGResultPaths, index: number) =>
          path
            .toShapes(true)
            .map((shape: Shape) => ({ index, shape, color: path.color }))
        ),
      [paths]
    );
    //
    useHelper(sceneRef, Box3Helper, new Color("cyan"));

    return (
      <Center>
        <mesh
          ref={sceneRef}
          {...props}
          //   rotation={[-Math.PI / 2, 0, Math.PI]}
        >
          {shapes.map((svgProps: any, key: number) => (
            <SvgShape key={key} {...svgProps}></SvgShape>
          ))}
        </mesh>
      </Center>
    );
  }
);

const SvgComponent = (
  props: JSX.IntrinsicElements["mesh"] & {
    url: string;
    sceneRef?: any;
    // scale,
  }
) => (
  <Suspense
    fallback={<DefaultModel {...props} />}
    children={<SvgAsync {...props} />}
  />
);

export default SvgComponent;
