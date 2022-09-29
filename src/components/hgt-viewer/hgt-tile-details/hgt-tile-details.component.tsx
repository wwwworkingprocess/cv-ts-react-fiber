import { useMemo } from "react";

import coloring from "../../../utils/colors";
import { imagedata_to_dataurl } from "../../../utils/canvasutils";
import { changeEndianness, normalizeElevationData } from "../../../utils/srtm";

const HgtTileDetails = (props: { tileBuffer: ArrayBuffer | undefined }) => {
  const { tileBuffer } = props;
  //
  const transformInput = (buffer: ArrayBuffer | undefined) => {
    //
    // [1201x1201] >> endian + normalize
    //
    const transform = (e: ArrayBuffer) =>
      normalizeElevationData(changeEndianness(new Int16Array(e)));
    //
    return buffer ? transform(buffer) : undefined;
  };
  //
  const createImageData = (i16: Int16Array | undefined) => {
    if (!i16) return undefined;
    //
    const id = new ImageData(1201, 1201);
    //
    for (let i = 0; i < i16.length; i++) {
      const height = i16[i];
      const c = coloring.get_color_by_height(height);
      //
      const offset = i * 4;
      id.data[offset] = c.r; // R value
      id.data[offset + 1] = c.g; // G value
      id.data[offset + 2] = c.b; // B value
      id.data[offset + 3] = 255; // A value
    }
    //
    return id;
  };
  //
  const dataurl = useMemo(() => {
    if (tileBuffer) {
      //
      const i16 = transformInput(tileBuffer);
      const imagedata = createImageData(i16);
      //
      return imagedata
        ? imagedata_to_dataurl(imagedata, 1201, 1201)
        : undefined;
    }
  }, [tileBuffer]);

  //
  return (
    <div>
      1201x1201 image
      <img
        alt={""}
        src={dataurl}
        style={{ width: "1201px", height: "1201px", zoom: 0.5 }}
      />
    </div>
  );
};

export default HgtTileDetails;
