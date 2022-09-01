import * as THREE from "three";

class CanvasUtilsSingleton {
  circle_ctx: CanvasRenderingContext2D | null = null;
  //
  constructor() {
    console.log("CanvasUtilsSingleton created");
  }
  //
  canvas_to_texture_power_of_two = (canvas: HTMLCanvasElement) => {
    const ct = new THREE.CanvasTexture(canvas);
    //
    ct.generateMipmaps = true;
    ct.wrapS = THREE.ClampToEdgeWrapping;
    ct.wrapT = THREE.ClampToEdgeWrapping;
    //
    ct.needsUpdate = true;
    //
    return ct;
  };
  //
  create_empty_context = (w: number, h: number, fillStyle = "#000000") => {
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext("2d");
    //
    if (ctx) {
      ctx.fillStyle = fillStyle;
      ctx.fillRect(0, 0, w, h);
    }
    //
    return ctx;
  };
  //
  get_context_as_uint8_array = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number
  ) => {
    return new Uint8Array(ctx.getImageData(0, 0, w, h).data.buffer);
  };
  //
  load_img_as_context = (
    url: string,
    w: number,
    h: number,
    fillStyle = "#000000"
  ): Promise<CanvasRenderingContext2D | null> => {
    return new Promise(async (resolve, reject) => {
      //
      const img = new Image();
      //
      try {
        const me = this;
        //
        img.onload = () => {
          const ctx = me.create_empty_context(w, h);
          //
          if (ctx) ctx.drawImage(img, 0, 0);
          //
          resolve(ctx);
        };
        //
        img.src = url; // start loading
      } catch (ex) {
        console.log(ex);
        reject(ex);
      }
    });
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
      ctx.arc(x, y, radius, 0, Math.PI * 2, true); // full circle [0..2pi]
      ctx.fill();
    }
  };
  //
  create_mask_texture_circular = (x: number, y: number, radius: number) => {
    const w = 1200,
      h = 1200,
      ctx = this.create_empty_context(w, h);
    //
    this.circle_ctx = ctx;
    //
    if (ctx) {
      ctx.fillStyle = "#fff";
      //
      this.draw_circle();
      //
      const texture = new THREE.CanvasTexture(ctx.canvas, 1200, 1200);
      //
      texture.flipY = true;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.generateMipmaps = false; //it's likely that our texture will not have "power of two" size, meaning that mipmaps are not going to be supported on WebGL 1.0, so let's turn them off
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter; //texture.magFilter = THREE.NearestFilter;    texture.minFilter = THREE.NearestFilter;
      //
      return { texture, canvas: ctx.canvas };
    } else return { texture: null, canvas: null };
  };
}

const cu = new CanvasUtilsSingleton();

export default cu;
