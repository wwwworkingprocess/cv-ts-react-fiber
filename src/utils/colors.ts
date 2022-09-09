class ColorHelper {
  get_color_by_height = (height_at_point: number) => {
    let c = { r: 0, g: 0, b: 0, a: 255 };
    //
    const blue = { r: 80, g: 86, b: 185, a: 255 }; // var black = { r: 0, g: 0, b: 0, a: 255 };
    const is_water = height_at_point === 0; //  height_at_point === -99;
    //
    if (is_water) {
      c = blue;
    } else {
      const hap = Math.max(0, height_at_point);
      const hap700 = hap - 700;
      const hap755 = hap - 755;
      const hap1100 = hap - 1100;
      const hap2000 = hap - 2155;
      //
      if (height_at_point < 0) {
        c.r = Math.max(0, 20 + Math.abs(height_at_point)) % 55;
        c.g = Math.max(0, 38 + Math.abs(height_at_point)) % 55;
        c.b = 0; // 80 + (Math.abs(40 - height_at_point) % 145);
      } else {
        //
        if (hap < 255) {
          c.r = Math.max(0, 85 - Math.floor(hap / 9)) % 255;
          c.g = Math.max(0, 190 - Math.floor(hap / 2.456)) % 255;
          c.b = Math.max(0, 40 - Math.floor(hap / 255)) % 255;
        } else {
          if (hap < 755) {
            c.r = 120 + (Math.floor(hap700 / 6) % 255);
            c.g = 100 + (Math.floor(hap700 / 11) % 255);
            c.b = 31 + (Math.floor(hap700 / 16) % 255);
          } else {
            if (hap < 1155) {
              c.r = 180 + (Math.floor(hap755 / 10) % 75);
              c.g = Math.abs(180 - Math.floor(hap755 / 6)) % 255;
              c.b = Math.abs(70 - Math.floor(hap755 / 7)) % 255;
            } else {
              if (hap < 2155) {
                c.r = 150 + (Math.abs(8 - Math.floor(hap1100 / 22)) % 125);
                c.g = 150 + (Math.abs(11 - Math.floor(hap1100 / 111)) % 125);
                c.b = 100 + (Math.abs(2 - Math.floor(hap1100 / 55)) % 155); //!!!
              } else {
                c.r = 55 + (Math.floor(hap2000 / 23) % 255);
                c.g = 18 + (Math.floor(hap2000 / 28) % 255);
                c.b = 7 + (Math.floor(hap2000 / 77) % 128); //!!!
              }
            }
          }
        }
      }
    }
    //
    return c;
  };
}

const coloring = new ColorHelper();

export default coloring;
