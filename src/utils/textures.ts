import * as THREE from "three";
import coloring from "./colors";

class TextureFactorySingleton {
  circle_ctx: CanvasRenderingContext2D | null = null;
  //
  // constructor() {}
  //
  create_mask_texture = (_hgt: any) => {
    const mask = _hgt.data;
    const data = new Uint8Array(mask.length);
    //
    data.set(mask.map((v: number) => (v === 0 ? 0 : 255)));
    //
    const texture = new THREE.DataTexture(
      data,
      1200,
      1200,
      THREE.LuminanceFormat,
      THREE.UnsignedByteType
    );
    //
    texture.flipY = true;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.generateMipmaps = false; //it's likely that our texture will not have "power of two" size, meaning that mipmaps are not going to be supported on WebGL 1.0, so let's turn them off
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter; //texture.magFilter = THREE.NearestFilter;    texture.minFilter = THREE.NearestFilter;
    //
    return texture;
  };
  //
  draw_circle = () => {
    const rnd = (from: number, to: number) =>
      (from = Math.random() * (to - from));
    //
    if (this.circle_ctx) {
      const x = rnd(50, 1150),
        y = rnd(50, 1150),
        radius = rnd(150, 350);
      //
      const ctx = this.circle_ctx;
      //
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2, true); // Outer circle
      ctx.fill();
    }
  };
  //
  draw_rectangle = () => {
    const rnd = (from: number, to: number) =>
      (from = Math.random() * (to - from));
    //
    if (this.circle_ctx) {
      const x = rnd(50, 1150),
        y = rnd(50, 1150),
        radius = rnd(150, 350);
      //
      const ctx = this.circle_ctx;
      //
      ctx.beginPath();
      ctx.fillRect(x, y, radius, radius); // Outer circle
      //ctx.fill();
    }
  };
  //
  load_from_url_sync = (url: string) => THREE.ImageUtils.loadTexture(url);
  //
  load_from_url = (url: string): Promise<THREE.Texture> => {
    return new Promise(async (resolve, reject) => {
      //
      const loader = new THREE.TextureLoader();
      // loader.crossOrigin = 'anonymous'; // to allow nonCORS content
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
  //
  create_mask_texture_circular = (x: number, y: number, radius: number) => {
    let canvas, ctx;
    //
    //
    const w = 1200,
      h = 1200;
    canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    //
    ctx = canvas.getContext("2d");
    //
    if (ctx) {
      this.circle_ctx = ctx;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      //      ctx.drawCircle(0, 0, w, h);
      this.draw_circle();
    }
    //
    const texture = new THREE.CanvasTexture(canvas, 1200, 1200);
    //
    texture.flipY = true;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.generateMipmaps = false; //it's likely that our texture will not have "power of two" size, meaning that mipmaps are not going to be supported on WebGL 1.0, so let's turn them off
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter; //texture.magFilter = THREE.NearestFilter;    texture.minFilter = THREE.NearestFilter;
    //
    return { texture, canvas };
  };
  //
  generateTextureData = async (
    is_height: boolean,
    data: any,
    width: number,
    height: number
  ) => {
    let texture: THREE.DataTexture | THREE.CanvasTexture; //  new THREE.DataTexture
    //
    const use_canvas = true;
    //
    if (!is_height) {
      if (use_canvas) {
        const canvas = await this.generateTexture_STA(
          data,
          width,
          height,
          2,
          "debug_txt"
        );
        //
        texture = new THREE.CanvasTexture(canvas as any);
      } else {
        texture = (await this.generateTextureData_STA(
          data,
          width,
          height
        )) as any;
      }
    } else
      texture = (await this.generateTextureData_HEIGHT(
        data,
        width,
        height
      )) as any;
    //
    //texture.generateMipmaps = false; //it's likely that our texture will not have "power of two" size, meaning that mipmaps are not going to be supported on WebGL 1.0, so let's turn them off
    texture.generateMipmaps = true; //it's likely that our texture will not have "power of two" size, meaning that mipmaps are not going to be supported on WebGL 1.0, so let's turn them off
    //texture.minFilter = THREE.NearestFilter;
    //texture.magFilter = THREE.NearestFilter;
    /*default: */ texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.magFilter = THREE.LinearMipMapLinearFilter;
    texture.needsUpdate = true;
    //
    return texture;
  };
  //
  generateTextureData_STA = (data: any, width: number, height: number) => {
    return new Promise(async (resolve, reject) => {
      // STA based promise, resolves by drawing one tile
      try {
        const v = new THREE.Vector3(0, 0, 0),
          sun = new THREE.Vector3(1, 1, 1).normalize();
        //
        const w = width,
          h = height,
          tdata = new Uint8Array(3 * w * h);
        //
        for (let i = 0, j = 0, l = tdata.length; i < l; i += 3, j++) {
          v.x = data[j - 2] - data[j + 2];
          v.y = 2;
          v.z = data[j - width * 2] - data[j + width * 2];
          v.normalize();
          //
          const shade = v.dot(sun);
          //
          const c = coloring.get_color_by_height(data[j]);
          //
          tdata[i] = c.r * (0.75 + shade * 0.5);
          tdata[i + 1] = c.g * (0.75 + shade * 0.5);
          tdata[i + 2] = c.b * (0.75 + shade * 0.5);
        }
        //
        const texture = new THREE.DataTexture(tdata, w, h, THREE.RGBFormat);
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;
        texture.flipY = true;
        texture.anisotropy = 16;
        //
        resolve(texture);
      } catch (ex) {
        reject(ex);
      }
    });
  };
  //
  generateTexture_STA = (
    data: any,
    width: number,
    height: number,
    SCALE: number,
    txt: string
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        let canvas, ctx, image, id, shade;
        //
        const v3 = new THREE.Vector3(0, 0, 0),
          sun = new THREE.Vector3(1, 1, 1);
        sun.normalize();
        //
        canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        //
        ctx = canvas.getContext("2d");
        //
        if (ctx) {
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, width, height);
          //
          image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
        //
        id = image?.data ?? new Uint8ClampedArray(0);
        //
        for (let i = 0, j = 0, l = id.length; i < l; i += 4, j++) {
          v3.x = (data[j - 2] || 0) - (data[j + 2] || 0);
          v3.y = 2;
          v3.z = (data[j - width * 2] || 0) - (data[j + width * 2] || 0);
          v3.normalize();
          //
          shade = v3.dot(sun) || 0;
          //
          const c = coloring.get_color_by_height(data[j]);
          //
          // const mul = (rgb: THREE.Color, sh: number, tint: number = 1) => {
          //   const v0 = new THREE.Vector3(rgb.r, rgb.g, rgb.b);
          //   const v1 = new THREE.Vector3(
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
          const canvasScaled = document.createElement("canvas");
          canvasScaled.width = width * SCALE;
          canvasScaled.height = height * SCALE;
          //
          image = ctx?.getImageData(
            0,
            0,
            canvasScaled.width,
            canvasScaled.height
          );
          id = image?.data ?? new Uint8ClampedArray(0);
          //
          for (let i = 0, l = id.length; i < l; i += 4) {
            const v = ~~(Math.random() * 5);
            id[i] += v;
            id[i + 1] += v;
            id[i + 2] += v;
          }
          //
          const ctx_scaled = canvasScaled.getContext("2d");
          //
          if (ctx_scaled) {
            ctx_scaled.scale(SCALE, SCALE);
            ctx_scaled.drawImage(canvas, 0, 0);
          }
          //
          resolve(canvasScaled);
        }
      } catch (ex) {
        reject(ex);
      }
    });
  };
  //
  generateTextureData_HEIGHT = (data: any, width: number, height: number) => {
    return new Promise(async (resolve, reject) => {
      try {
        const w = width,
          h = height,
          tdata = new Uint8Array(3 * w * h);
        //
        for (let i = 0, j = 0, l = tdata.length; i < l; i += 3, j++) {
          const v = data[j],
            c = { r: 0, g: (v - (v % 256)) / 256, b: v % 256 };
          //
          tdata[i] = c.r;
          tdata[i + 1] = c.g;
          tdata[i + 2] = c.b;
        }
        //
        const texture = new THREE.DataTexture(tdata, w, h, THREE.RGBFormat);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.encoding = THREE.sRGBEncoding;
        texture.flipY = true;
        texture.anisotropy = 16;
        //
        resolve(texture);
      } catch (ex) {
        reject(ex);
      }
    });
  };
}

const tfs = new TextureFactorySingleton();

export default tfs;
