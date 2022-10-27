import { CanvasTexture, ClampToEdgeWrapping, LinearFilter } from "three";

//
// Single canvas shared by the utility functions
//
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

/**
 * Transforms image data to dataURL using the provided settings
 *
 * @param imageData The image data to transform.
 * @param type The standard MIME type for the image format to return.
 * @param quality A number between 0 and 1 indicating the image quality.
 */
export const toDataUrl = (
  imageData: ImageData,
  type?: string | undefined,
  quality?: number | undefined
): string => {
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  //
  if (ctx) ctx.putImageData(imageData, 0, 0);
  //
  return canvas.toDataURL(type, quality);
};

/**
 * Creates an empty context, using the provided dimension and (background) color.
 *
 * @param imageData The image data to transform.
 * @param type The standard MIME type for the image format to return.
 * @param quality A number between 0 and 1 indicating the image quality.
 */
export const createContext2D = (
  width: number,
  height: number,
  fillStyle?: string | undefined
): CanvasRenderingContext2D | null => {
  const cv = document.createElement("canvas");
  cv.width = width;
  cv.height = height;
  const ctx = cv.getContext("2d");
  //
  if (ctx) {
    ctx.fillStyle = fillStyle ?? "#000000";
    ctx.fillRect(0, 0, width, height);
  }
  //
  return ctx;
};

/**
 * Reads data from the provided canvas, and returns it as an Uint8Array
 *
 * @param ctx The context to read data from.
 * @param width Image dimension, width in pixels
 * @param height Image dimension, height in pixels
 */
export const toUint8Array = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): Uint8Array => {
  const id = ctx.getImageData(0, 0, width, height);
  //
  return new Uint8Array(id.data.buffer);
};

/**
 * Draws a circle to the provided context,
 * with the provided radius and  position
 *
 * @param context The context to draw to
 * @param x Position of the circle's center point
 * @param y Position of the circle's center point
 * @param r Radius to use, in pixels
 */
export const drawCircle = (
  context: CanvasRenderingContext2D | null,
  x: number,
  y: number,
  r: number
) => {
  if (context) {
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2, true);
    context.fill();
  }
};

/**
 * Creates a new CanvasTexture, using the provided canvas as an input.
 *
 * @param canvas The canvas to read data from.
 */
export const createCanvasTexture = (
  canvas: HTMLCanvasElement
): CanvasTexture => {
  const ct = new CanvasTexture(canvas);
  //
  ct.generateMipmaps = true;
  ct.wrapS = ClampToEdgeWrapping;
  ct.wrapT = ClampToEdgeWrapping;
  //
  ct.needsUpdate = true;
  //
  return ct;
};

/**
 * Promise for loading image information from the provided url into
 * a new canvas. The promise resolves with the context, after the
 * image has been successfully drawn to the canvas.
 *
 * The image is drawn to the top left corner, and when the image is
 * larger then the provided width or height, it will get cropped.
 *
 * @param url The url to read data from.
 * @param width Dimension, the width of the canvas
 * @param height Dimension, the height of the canvas
 */
export const loadAsContext2D = (
  url: string,
  width: number,
  height: number
): Promise<CanvasRenderingContext2D | null> =>
  new Promise(async (resolve, reject) => {
    const img = new Image();
    //
    const onLoad = () => {
      try {
        const ctx = createContext2D(width, height);
        //
        if (ctx) ctx.drawImage(img, 0, 0);
        //
        resolve(ctx);
      } catch (ex) {
        console.error(`Failed loading image from url: ${url}`, ex);
        reject(ex);
      }
    };
    //
    // start loading image from remote location
    //
    img.onload = onLoad;
    img.src = url;
  });

/**
 * Creates a new fixed sized context (1200x1200) with white background and
 * draws a circle to it using black fill.
 *
 * This is a 'Reveal mask', so masked content is only visible inside the circle.
 *
 * Returns both the created Context2D and the CanvasTexture using it.
 *
 * @param context The context to draw to
 * @param x Position of the circle's center point
 * @param y Position of the circle's center point
 * @param radius Radius to use, in pixels
 */
export const createMaskWithCircle = (x: number, y: number, radius: number) => {
  const [maskWidth, maskHeight] = [1200, 1200];
  const [black, white] = ["#000000", "#ffffff"];
  //
  const ctx = createContext2D(maskWidth, maskHeight, black);
  //
  if (ctx) {
    ctx.fillStyle = white;
    //
    drawCircle(ctx, x, y, radius);
    //
    const t = new CanvasTexture(ctx.canvas, maskWidth, maskHeight);
    //
    t.flipY = true;
    t.wrapS = ClampToEdgeWrapping;
    t.wrapT = ClampToEdgeWrapping;
    t.minFilter = LinearFilter;
    t.magFilter = LinearFilter;
    //
    t.generateMipmaps = false; // mask dimension is not a power of two
    //
    return { texture: t, canvas: ctx.canvas };
  } else return { texture: null, canvas: null };
};
