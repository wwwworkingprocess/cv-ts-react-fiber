/**
 * Returns the default basecolor for the given pixel, based on the height provided
 *
 * @param height_at_point Elevation of point in meters. Water level is at zero.
 * @returns The color in rgba format, using [0..255] integer range for channel information.
 */
export const colorByHeight = (height_at_point: number) => {
  const is_water = height_at_point === 0; // consider: -99
  const blue = { r: 80, g: 86, b: 185, a: 255 };
  //
  if (is_water) return blue;
  //
  //
  let r, g, b;
  //
  //
  const h = Math.max(0, height_at_point);
  const [ha, hb, hc, hd] = [700, 755, 1100, 2155].map((shift) => h - shift);
  //
  if (height_at_point < 0) {
    r = Math.max(0, 20 + Math.abs(height_at_point)) % 55;
    g = Math.max(0, 38 + Math.abs(height_at_point)) % 55;
    b = 0;
  } else {
    //
    if (h < 255) {
      r = Math.max(0, 85 - Math.floor(h / 9)) % 255;
      g = Math.max(0, 190 - Math.floor(h / 2.456)) % 255;
      b = Math.max(0, 40 - Math.floor(h / 255)) % 255;
    } else {
      if (h < 755) {
        r = 120 + (Math.floor(ha / 6) % 255);
        g = 100 + (Math.floor(ha / 11) % 255);
        b = 31 + (Math.floor(ha / 16) % 255);
      } else {
        if (h < 1155) {
          r = 180 + (Math.floor(hb / 10) % 75);
          g = Math.abs(180 - Math.floor(hb / 6)) % 255;
          b = Math.abs(70 - Math.floor(hb / 7)) % 255;
        } else {
          if (h < 2155) {
            r = 150 + (Math.abs(8 - Math.floor(hc / 22)) % 125);
            g = 150 + (Math.abs(11 - Math.floor(hc / 111)) % 125);
            b = 100 + (Math.abs(2 - Math.floor(hc / 55)) % 155);
          } else {
            r = 55 + (Math.floor(hd / 23) % 255);
            g = 18 + (Math.floor(hd / 28) % 255);
            b = 7 + (Math.floor(hd / 77) % 128);
          }
        }
      }
    }
  }
  //
  return { r, g, b, a: 255 };
};
