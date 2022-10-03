import { useMemo } from "react";
import { isMobile } from "react-device-detect";

import {
  Path,
  StyledSvgCanvas,
  SvgCanvasContainer,
} from "./svg-world-map.styles";

type SvgWorldMapProps = {
  svgCountries: Array<any> | undefined;
  countrySelected: any;
  //
  mouseEnter: (country: any) => void;
  mouseLeave: () => void;
};

const SvgWorldMap = (props: SvgWorldMapProps) => {
  const { svgCountries, countrySelected, mouseEnter, mouseLeave } = props;
  //
  const [svgCanvasWidth, svgCanvasHeight] = [720, 360];
  //
  const svgPathMemo = useMemo(() => {
    if (!svgCountries) return { paths: [undefined] };

    const projectToCanvas = (latLng: { lat: number; lng: number }) => {
      //
      // projecting from [ lat:[-90, +90], lng: [-180, +180] ]
      //            to   [ x: [0, canvasWidth], y: [0, canvasHeight] ]
      //
      return {
        x: (latLng.lng + 180) * (svgCanvasWidth / 360),
        y:
          svgCanvasHeight / 2 -
          ((svgCanvasHeight *
            Math.log(
              Math.tan(Math.PI / 4 + (latLng.lat * Math.PI) / 180 / 2)
            )) /
            (2 * Math.PI)) *
            (svgCanvasWidth / svgCanvasHeight),
      };
    };

    //
    function convertCoordinatesToSvgPaths(
      coordArrays: Array<Array<[number, number]>>,
      fx: any
    ) {
      const svgPaths = [];
      //
      let minX = svgCanvasWidth;
      let minY = svgCanvasHeight;
      let maxX = 0;
      let maxY = 0;

      for (let pp = 0; pp < coordArrays.length; ++pp) {
        const [coords /*, outterRingCoords*/] = coordArrays[pp];
        const svgPath = [];
        //
        for (let p = 0; p < coords.length; ++p) {
          const point = projectToCanvas(fx(coords[p]));
          //
          const valid = !(isNaN(point.x) || isNaN(point.y));
          //
          if (valid) {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
            //
            svgPath.push([point.x, point.y].join(","));
          }
        }
        //
        if (svgPath.length) {
          svgPaths.push(svgPath.join(" "));
        }
      }

      return {
        //path: "M" + svgPaths.join("z M") + "z",   // single path
        paths: svgPaths.map((svgp) => `M${svgp}z`), // one path per feature
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      };
    }
    //
    const svgProps = convertCoordinatesToSvgPaths(
      svgCountries.map((c) => c.path),
      (coord: [number, number]) => ({ lat: coord[1], lng: coord[0] })
    );
    //
    return { ...svgProps, width: svgCanvasWidth, height: svgCanvasHeight };
  }, [svgCountries, svgCanvasWidth, svgCanvasHeight]);
  //
  return svgCountries ? (
    <SvgCanvasContainer isMobile={isMobile}>
      {svgPathMemo && (
        <StyledSvgCanvas
          isMobile={isMobile}
          {...svgPathMemo}
          width={svgCanvasWidth}
          height={svgCanvasHeight}
        >
          {svgCountries.map(({ id, name, path }, index) => {
            return (
              <Path
                key={index}
                color={"blue"}
                strokeWidth={0.5}
                data-testid={name}
                onMouseEnter={mouseEnter.bind(null, { name })}
                onMouseLeave={mouseLeave}
                d={svgPathMemo.paths[index]}
              />
            );
          })}
        </StyledSvgCanvas>
      )}
      {countrySelected && JSON.stringify(countrySelected)}
    </SvgCanvasContainer>
  ) : null;
};

export default SvgWorldMap;
