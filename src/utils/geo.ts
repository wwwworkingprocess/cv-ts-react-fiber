const EARTH_RADIUS = 6378137;

export const rad = (degrees: number) => degrees * (Math.PI / 180);
export const deg = (radians: number) => radians * (180 / Math.PI);

export const heading = (from: [number, number], to: [number, number]) => {
  const y =
    Math.sin((Math.PI * (from[0] - to[0])) / 180) *
    Math.cos((Math.PI * to[1]) / 180);
  //
  const x =
    Math.cos((Math.PI * from[1]) / 180) * Math.sin((Math.PI * to[1]) / 180) -
    Math.sin((Math.PI * from[1]) / 180) *
      Math.cos((Math.PI * to[1]) / 180) *
      Math.cos((Math.PI * (from[0] - to[0])) / 180);
  //
  return (180 * Math.atan2(y, x)) / Math.PI;
};

export const distance = (
  from: [number, number],
  to: [number, number],
  radius?: number
) => {
  radius = radius || EARTH_RADIUS;
  //
  const sinHalfDeltaLon = Math.sin((Math.PI * (to[0] - from[0])) / 360);
  const sinHalfDeltaLat = Math.sin((Math.PI * (to[1] - from[1])) / 360);
  //
  const a =
    sinHalfDeltaLat * sinHalfDeltaLat +
    sinHalfDeltaLon *
      sinHalfDeltaLon *
      Math.cos((Math.PI * from[1]) / 180) *
      Math.cos((Math.PI * to[1]) / 180);
  //
  return 2 * radius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const distanceFromCoords = (
  c: { coords?: Array<number> | undefined },
  { x, y }: { x: number; y: number }
) => {
  if (!c.coords) return 0;
  //
  const [lat1, lat2] = [c.coords[0], x];
  const [lon1, lon2] = [c.coords[1], y];
  //
  return distance([lon1, lat1], [lon2, lat2]) * 10e-4; // return km
};

export const radial = (
  from: [number, number],
  tc_deg: number,
  d_m: number,
  wrap: boolean,
  radius: number
) => {
  radius = radius || EARTH_RADIUS;
  //
  const tc = rad(tc_deg);
  const d = d_m / radius;
  //
  const [lon1, lat1] = [rad(from[0]), rad(from[1])];
  //
  const lat = Math.asin(
    Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(tc)
  );
  //
  const dlon = Math.atan2(
    Math.sin(tc) * Math.sin(d) * Math.cos(lat1),
    Math.cos(d) - Math.sin(lat1) * Math.sin(lat)
  );
  //
  const lon = wrap
    ? ((lon1 - dlon + Math.PI) % (2 * Math.PI)) - Math.PI
    : lon1 - dlon + Math.PI - Math.PI;
  //
  return [deg(lon), deg(lat)];
};
