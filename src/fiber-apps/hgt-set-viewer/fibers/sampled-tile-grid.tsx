import { useMemo } from "react";

import {
  createOffsetsForBlock,
  createPositionsFromHeights,
  createTextureFromColors,
} from "../../../utils/srtm-sampling";
import coloring from "../../../utils/colors";
import { changeEndianness } from "../../../utils/srtm";

import SampledTile3D from "./sampled-tile-3d";

const useBlockOperations = (
  values: Array<ArrayBuffer> | undefined,
  xyMemo: any,
  dimensionMemo: Array<number>,
  heightScale: number
) => {
  const ops = useMemo(() => {
    const findContentBufferByBlock = (blockX: number, blockY: number) => {
      const zi = xyMemo.grid?.[blockY]?.[blockX]?.zi; // swapped !
      const buffer = values && zi !== -1 ? values[zi] : undefined;
      //
      return buffer;
    };
    //
    return {
      findBuffer: findContentBufferByBlock,
      createOffsetsForBlock,
      createPositionsFromHeights,
      createTextureFromColors,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, dimensionMemo, heightScale]);
  //
  return ops;
};

//
//
//
const SampledTileGrid = (
  props: JSX.IntrinsicElements["group"] & {
    values: Array<ArrayBuffer>;
    dimensionMemo: Array<number>;
    xyMemo: any;
    areaScaleX: number;
    areaScaleY: number;
    heightScale: number;
  }
) => {
  const {
    values,
    dimensionMemo,
    xyMemo,
    areaScaleX,
    areaScaleY,
    heightScale,
    ...groupProps
  } = props;
  //
  const ops = useBlockOperations(values, xyMemo, dimensionMemo, heightScale);
  //
  const renderedGridMemo = useMemo(() => {
    // console.log("RERENDERING GRID", ops);
    //
    const G = dimensionMemo;
    const segments = G.length - 1;
    //
    const newArray = (size: number) => [...new Array(size).keys()];
    //
    // For every 300x300 block ( 4x4 for each original 1201x1201 tile)
    //
    // 1. find zipIndex from xyMemo by block   >> ArrayBuffer
    // 2. create offsets, taking every nth datavalue from the original buffer >> Array<number>
    // 3. pick values by offsets  Array<number> (indices) >> Array<number> (heights)
    // 4. render a datatexture  Array<number> (heights) >> Uint8Array (rgba colors)
    // 5. create position buffer for vertices  Array<number> (heights) >> Float32Array (xyz coords)
    //
    return newArray(areaScaleX).map((n) =>
      newArray(areaScaleY).map((m) => {
        const key = `${n}_${m}_${dimensionMemo.length}`;
        const scale = 4; // [1200x1200] ->  [300x300]
        //
        const blockX = Math.floor(n / scale); // rows
        const blockY = Math.floor(m / scale); // cols
        //
        const currentBuffer = ops.findBuffer(blockX, blockY); // 1
        //
        let texture;
        let positions;
        //
        if (currentBuffer) {
          const offsets = ops.createOffsetsForBlock(G, n, m, scale);
          //
          //  Taking out values from the original buffer (where one value is 2x1 bytes)
          //
          const takeByOffset = (off: number) =>
            changeEndianness(
              new Int16Array(currentBuffer.slice(off, off + 2))
            )[0];
          //
          const hs = offsets.map(takeByOffset); // height information ( 1 value per sample)
          const cols = hs.map(coloring.get_color_by_height); // rgba   ( 4 value per sample)
          //
          // creating a downsampled datatexture for the tile, based on the height data
          //
          texture = ops.createTextureFromColors(cols, G.length, G.length);
          texture.needsUpdate = true;
          //
          // filling position data for vertices, based on the height data
          //
          positions = ops.createPositionsFromHeights(hs, G, 0.75, 0.75, 1); // new Float32Array(arr);
        } else {
          positions = new Float32Array(0);
          texture = undefined;
        }
        //
        //
        //
        return (
          <SampledTile3D
            key={key}
            position={[n, 0.0031, m]}
            segments={segments}
            positions={positions}
            texture={texture}
          />
        );
      })
    );
    // excluding xyMemo.grid intended!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, dimensionMemo.length, areaScaleX, areaScaleY]);

  //
  return (
    <group scale={[1, heightScale, 1]} {...groupProps}>
      {renderedGridMemo}
    </group>
  );
};

export default SampledTileGrid;
