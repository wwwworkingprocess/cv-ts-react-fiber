import { useEffect, useMemo, useState } from "react";

import {
  DataTexture,
  LinearFilter,
  RGBAFormat,
  sRGBEncoding,
  Texture,
  UnsignedByteType,
  Vector3,
} from "three";

import coloring from "../../../utils/colors";

const useHeightBasedTexture = (heights1200: Int16Array | undefined) => {
  const [dataTexture, setDataTexture] = useState<Texture>();

  //
  // creating array of RGBA colors, color is based on height and self shaded
  //
  const heightsAsColors: Uint8Array | undefined = useMemo(() => {
    if (heights1200) {
      const trios = [] as Array<number>;

      const width = 1200; // todo check
      const v3 = new Vector3(0, 0, 0),
        sun = new Vector3(1, 1, 1);
      sun.normalize();
      //
      for (let i = 0; i < heights1200.length; i++) {
        const height = heights1200[i];
        //
        // apply height based self-shading
        //
        v3.x = (heights1200[i - 2] || 0) - (heights1200[i + 2] || 0);
        v3.y = 2;
        v3.z =
          (heights1200[i - width * 2] || 0) - (heights1200[i + width * 2] || 0);
        //
        v3.normalize();
        //
        const shade = v3.dot(sun) || 0;
        const c = coloring.get_color_by_height(height);
        //
        const r = c.r * (0.75 + shade * 0.525); // original 'blending' R
        const g = c.g * (0.75 + shade * 0.525); // original 'blending' G
        const b = c.b * (0.75 + shade * 0.525); // original 'blending' B
        //
        trios.push(r, g, b, 255);
      }
      //
      return Uint8Array.from(trios);
    }
    //
    return undefined;
  }, [heights1200]);

  //
  // create Texture once each pixel has its color
  //
  useEffect(() => {
    if (heightsAsColors) {
      const texture = new DataTexture(
        heightsAsColors,
        1200,
        1200,
        RGBAFormat,
        UnsignedByteType
      );
      //
      texture.flipY = true; // flipping image on vertical axis
      //
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      texture.encoding = sRGBEncoding;
      //
      texture.needsUpdate = true;
      //
      setDataTexture(texture);
      //
      return () => texture.dispose();
    } else {
      setDataTexture(undefined);
    }
  }, [heightsAsColors]);

  return dataTexture;
};

export default useHeightBasedTexture;
