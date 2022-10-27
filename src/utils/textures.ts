import {
  Vector3,
  //
  Texture,
  DataTexture,
  CanvasTexture,
  //
  ClampToEdgeWrapping,
  LinearFilter,
  LinearMipMapLinearFilter,
  //
  LuminanceFormat,
  RGBFormat,
  sRGBEncoding,
  UnsignedByteType,
  //
  TextureLoader,
} from "three";

import { colorByHeight } from "./colors";

/**
 * Promise for loading image information, using TextureLoader of THREE.js,
 * returning the result as a Texture
 *
 * @param url The url to read data from.
 */
export const loadTexture = (url: string): Promise<Texture> => {
  return new Promise(async (resolve, reject) => {
    const loader = new TextureLoader();
    //
    try {
      const texture = await loader.loadAsync(url);
      //
      resolve(texture);
    } catch (ex) {
      console.error("failed to load img", ex);
      reject(ex);
    }
  });
};

/**
 * Creates a new mask based on the provided height information.
 * Where the elevation is above 'water level' the mask reveals.
 *
 * @param heights The height information as input
 * @param water_level The number used to represent water in the input (default 0, consider -99)
 */
export const createWaterMaskForHgt = (
  heights: Array<number>,
  water_level?: number
) => {
  const [w, h] = [1200, 1200];
  const water = water_level ?? 0;
  const toMaskValue = (v: number) => (v === water ? 0 : 255);
  //
  const data = new Uint8Array(heights.length);
  data.set(heights.map(toMaskValue));
  //
  const t = new DataTexture(data, w, h, LuminanceFormat, UnsignedByteType);
  //
  t.flipY = true;
  t.wrapS = ClampToEdgeWrapping;
  t.wrapT = ClampToEdgeWrapping;
  t.minFilter = LinearFilter;
  t.magFilter = LinearFilter;
  //
  return t;
};

//
// Helper functions to create textures based on height information
//
export class TextureFactorySingleton {
  //
  generateTextureData = async (
    is_height: boolean,
    data: any,
    width: number,
    height: number
  ): Promise<DataTexture | CanvasTexture> => {
    let t: DataTexture | CanvasTexture;
    const [w, h] = [width, height];
    //
    const use_canvas = true;
    //
    if (!is_height) {
      if (use_canvas) {
        const canvas = await this.generateTexture_STA(
          data,
          w,
          h,
          2,
          "debug_txt"
        );
        //
        t = new CanvasTexture(canvas as any);
      } else {
        t = (await this.generateTextureData_STA(data, w, h)) as any;
      }
    } else t = (await this.generateTextureData_HEIGHT(data, w, h)) as any;
    //
    t.generateMipmaps = false;
    t.minFilter = LinearMipMapLinearFilter;
    t.magFilter = LinearMipMapLinearFilter;
    //
    t.needsUpdate = true;
    //
    return t;
  };
  //
  // STA based promise, resolves by drawing one tile
  //
  generateTextureData_STA = (
    heights: Array<number>,
    width: number,
    height: number
  ): Promise<DataTexture> => {
    return new Promise(async (resolve, reject) => {
      const [w, h] = [width, height];
      //
      const v = new Vector3(0, 0, 0);
      const sun = new Vector3(1, 1, 1).normalize();
      //
      try {
        const tdata = new Uint8Array(3 * w * h);
        //
        for (let i = 0, j = 0, l = tdata.length; i < l; i += 3, j++) {
          v.x = heights[j - 2] - heights[j + 2];
          v.y = 2;
          v.z = heights[j - w * 2] - heights[j + w * 2];
          v.normalize();
          //
          const shade = v.dot(sun);
          //
          const c = colorByHeight(heights[j]);
          //
          tdata[i] = c.r * (0.75 + shade * 0.5);
          tdata[i + 1] = c.g * (0.75 + shade * 0.5);
          tdata[i + 2] = c.b * (0.75 + shade * 0.5);
        }
        //
        const t = new DataTexture(tdata, w, h, RGBFormat);
        //
        t.magFilter = LinearFilter;
        t.minFilter = LinearFilter;
        t.flipY = true;
        t.anisotropy = 16;
        //
        resolve(t);
      } catch (ex) {
        reject(ex);
      }
    });
  };
  //
  generateTexture_STA = (
    heights: Array<number>,
    width: number,
    height: number,
    SCALE: number,
    txt: string
  ): Promise<HTMLCanvasElement> => {
    return new Promise(async (resolve, reject) => {
      const [w, h] = [width, height];
      //
      const v3 = new Vector3(0, 0, 0);
      const sun = new Vector3(1, 1, 1).normalize();
      //
      try {
        let canvas, ctx, image, id;
        //
        canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        //
        ctx = canvas.getContext("2d");
        //
        if (ctx) {
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, w, h);
          //
          image = ctx.getImageData(0, 0, w, h);
        }
        //
        id = image?.data ?? new Uint8ClampedArray(0);
        //
        for (let i = 0, j = 0, l = id.length; i < l; i += 4, j++) {
          v3.x = (heights[j - 2] || 0) - (heights[j + 2] || 0);
          v3.y = 2;
          v3.z = (heights[j - w * 2] || 0) - (heights[j + w * 2] || 0);
          v3.normalize();
          //
          const shade = v3.dot(sun) || 0;
          //
          const c = colorByHeight(heights[j]);
          //
          // const mul = (rgb: Color, sh: number, tint: number = 1) => {
          //   const v0 = new Vector3(rgb.r, rgb.g, rgb.b);
          //   const v1 = new Vector3(
          //     128 - sh,
          //     128 - sh,
          //     128 - sh
          //   ).multiplyScalar(tint);
          //   const v = v1.multiply(v0); //.normalize();
          //   //
          //   return [v.x, v.y, v.z];
          // };
          //
          // const sh = 128 + (shade * 0.5) * 128;
          // const tint_factor = 0.1;
          // const arr = mul(c, sh, tint_factor);
          //
          // id[i] = sh;                                      // shade R
          // id[i + 1] = sh;                                  // shade G
          // id[i + 2] = sh;                                  // shade B
          // id[i] = (c.r);                                   // base color R
          // id[i + 1] = (c.g);                               // base color G
          // id[i + 2] = (c.b);                               // base color B
          // id[i] = arr[0];                                  // multiplied R
          // id[i + 1] = arr[1];                              // multiplied G
          // id[i + 2] = arr[2];                              // multiplied B
          id[i] = c.r * (0.75 + shade * 0.725); // original 'blending' R
          id[i + 1] = c.g * (0.75 + shade * 0.725); // original 'blending' G
          id[i + 2] = c.b * (0.75 + shade * 0.725); // original 'blending' B
        }
        //
        if (image) ctx?.putImageData(image, 0, 0);
        //
        if (ctx) {
          if (txt !== "") {
            /*debug: */ ctx.font = "24px Arial";
            ctx.fillText(txt, 100, 100);
          }
        }
        //
        //Scaled 4x, max output size 4096*4096
        //
        if (SCALE === 1) resolve(canvas);
        else {
          const scaled = document.createElement("canvas");
          scaled.width = width * SCALE;
          scaled.height = height * SCALE;
          //
          image = ctx?.getImageData(0, 0, scaled.width, scaled.height);
          id = image?.data ?? new Uint8ClampedArray(0);
          //
          for (let i = 0, l = id.length; i < l; i += 4) {
            const v = ~~(Math.random() * 5);
            id[i] += v;
            id[i + 1] += v;
            id[i + 2] += v;
          }
          //
          const ctx_scaled = scaled.getContext("2d");
          //
          if (ctx_scaled) {
            ctx_scaled.scale(SCALE, SCALE);
            ctx_scaled.drawImage(canvas, 0, 0);
          }
          //
          resolve(scaled);
        }
      } catch (ex) {
        reject(ex);
      }
    });
  };
  //
  generateTextureData_HEIGHT = (
    heights: Array<number>,
    width: number,
    height: number
  ): Promise<DataTexture> => {
    return new Promise(async (resolve, reject) => {
      try {
        const [w, h] = [width, height];
        const tdata = new Uint8Array(3 * w * h);
        //
        for (let i = 0, j = 0, l = tdata.length; i < l; i += 3, j++) {
          const v = heights[j];
          //
          tdata[i] = 0;
          tdata[i + 1] = (v - (v % 256)) / 256;
          tdata[i + 2] = v % 256;
        }
        //
        const t = new DataTexture(tdata, w, h, RGBFormat);
        //
        t.minFilter = LinearFilter;
        t.magFilter = LinearFilter;
        t.encoding = sRGBEncoding;
        t.flipY = true;
        t.anisotropy = 16;
        //
        resolve(t);
      } catch (ex) {
        reject(ex);
      }
    });
  };
}
