import { useMemo } from "react";

import { toDataUrl } from "../../../utils/canvas";
import { colorByHeight } from "../../../utils/colors";
import {
  changeEndianness,
  normalizeElevationData,
  removeLastRowAndColumn,
} from "../../../utils/srtm";

const transformInput = (first: ArrayBuffer | undefined) => {
  const keepEveryEightRowAndCol = (i16: Int16Array) =>
    i16.filter((v: number, i: number, a: Int16Array) => {
      const col_idx = i % 1200;
      const row_idx = (i - col_idx) / 1200;

      const isFourthCol = col_idx % 8 === 0;
      const isFourthRow = row_idx % 8 === 0;
      //
      return isFourthCol && isFourthRow;
    });
  //
  // [1201x1201] >> [1200x1200] >> [150x150] >> endian + normalize
  //
  const transform = (e: ArrayBuffer) =>
    normalizeElevationData(
      changeEndianness(keepEveryEightRowAndCol(removeLastRowAndColumn(e)))
    );
  //
  return first ? transform(first) : undefined;
};

const sampling = 150;
const createWaterTileDataUrl = () => {
  const length = sampling * sampling;
  //
  const id = new ImageData(sampling, sampling);
  //
  for (let i = 0; i < length; i++) {
    const offset = i * 4;
    //
    id.data[offset] = 80; // R value
    id.data[offset + 1] = 86; // G value
    id.data[offset + 2] = 185; // B value
    id.data[offset + 3] = 255; // A value
  }
  //
  return toDataUrl(id);
};

const waterTileDataUrl = createWaterTileDataUrl();
export const HgtThumbnailWater = (props: { sampling: number }) => {
  const src = waterTileDataUrl;
  const styles = { width: `${sampling}px`, height: `${sampling}px`, zoom: 1 };
  //
  return <img alt="" src={src} style={styles} />;
};

const HgtThumbnail = (props: {
  hgtBuffer1201: ArrayBuffer | undefined;
  zoom?: number; // 1, 0.75, 0.5, 0.25 etc
}) => {
  const { hgtBuffer1201, zoom } = props;
  const zoomUsed = zoom ?? 1;
  //
  const thumbsMemo = useMemo(
    () => (hgtBuffer1201 ? transformInput(hgtBuffer1201) : undefined),
    [hgtBuffer1201]
  );
  //
  const sampling = 150;
  const idMemo = useMemo(() => {
    if (thumbsMemo) {
      const id = new ImageData(sampling, sampling);
      //
      for (let i = 0; i < thumbsMemo.length; i++) {
        const height = thumbsMemo[i];
        const c = colorByHeight(height);
        //
        const offset = i * 4;
        id.data[offset] = c.r; // R value
        id.data[offset + 1] = c.g; // G value
        id.data[offset + 2] = c.b; // B value
        id.data[offset + 3] = 255; // A value
      }
      //
      return id;
    }
  }, [thumbsMemo]);
  //
  const dataUrl = useMemo(() => idMemo && toDataUrl(idMemo), [idMemo]);
  //
  return dataUrl ? (
    <img
      alt=""
      src={dataUrl}
      style={{
        width: `${sampling}px`,
        height: `${sampling}px`,
        zoom: zoomUsed,
      }}
    />
  ) : null;
};

export default HgtThumbnail;
