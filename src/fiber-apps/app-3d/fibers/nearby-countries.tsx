import { Html } from "@react-three/drei";
import { useRef } from "react";
import { Euler, Group, Vector3 } from "three";
import { CountryListItem } from "../../../components/demography/country-list/country-list.styles";

const NearbyCountries = (
  props: JSX.IntrinsicElements["group"] & {
    nearbyCountries: Array<any>;
    textures: any;
    images: any;
    availableCountryCodes: Array<string>;
    navigate: any;
  }
) => {
  const { nearbyCountries, textures, images, availableCountryCodes, navigate } =
    props;
  //
  const ref = useRef<Group>(null!);
  //
  // useFrame(({ clock }) => {
  //   if (ref.current) { }
  // });
  //
  if (!textures) return <></>;
  if (!images) return <></>;

  //
  //
  //
  const rendered = nearbyCountries.map((c, idx) => {
    if (!c.coords) return { x: 0, y: 0, z: 0 };
    //
    const x = Number(-1 * c.coords[0]);
    const y = Number(-1 * c.coords[1]);
    const z = 0;
    //
    const image = images[c.code];
    const available = availableCountryCodes.includes(c.code);
    //
    const label = c.name;
    const population = c.population ?? 0;
    const url = String(c.urls.flag);
    //
    return {
      code: c.code,
      x,
      y,
      z,
      label,
      population,
      url,
      texture: textures[idx],
      image,
      available,
    };
  });
  //
  const s = 0.0278;
  //
  const scale = new Vector3(1, -1, 1);
  const position = new Vector3(0, 0.0255, 0);
  const groupToStageScale = new Vector3(-1 * s, -1 * s, s);
  const groupToStageRotation = new Euler(-Math.PI / 2, 0, 0);
  //
  return (
    <group ref={ref} position={position} scale={scale}>
      <group scale={groupToStageScale} rotation={groupToStageRotation}>
        {rendered
          ? rendered.map(
              (
                {
                  code,
                  x,
                  y,
                  z,
                  label,
                  population,
                  url,
                  texture,
                  image,
                  available,
                },
                idx
              ) => (
                <mesh
                  key={idx}
                  castShadow
                  position={[x, y, z]}
                  onClick={(e) => {
                    const t = e.eventObject;
                    const worldPosition = { x, y, z };
                    const details = { available, population, url, image };
                    //
                    console.log("mesh", t, code, label, "pos", worldPosition);
                    console.log("mesh details", details);
                  }}
                >
                  <boxGeometry args={[1.25, 1.25, 1.25]} />
                  <meshBasicMaterial attach={`material`} map={texture} />

                  <CountryTooltip
                    idx={idx}
                    code={code}
                    available={available}
                    label={label}
                    population={population}
                    image={image}
                    navigate={navigate}
                  />
                </mesh>
              )
            )
          : null}
      </group>
    </group>
  );
};

const CountryTooltip = ({
  idx,
  code,
  available,
  label,
  population,
  image,
  navigate,
}: any) => (
  <Html distanceFactor={0.525} position={[0, 0, -2]} center>
    <CountryListItem
      key={idx}
      onClick={() => navigate(`./map/${code}/${code}`)}
      style={{
        userSelect: "none",
        // backgroundColor: "rgba(0,0,0,0.5)",
        backgroundColor: available ? "rgba(255,200,0,0.22)" : "rgba(0,0,0,0.5)",

        paddingTop: "10px",
        //
        borderRadius: "10px",
        border: available ? "solid 3px gold" : "solid 1px white",
        zoom: available ? "100%" : "75%",
        color: available ? "white" : "silver",
        fontWeight: available ? "bold" : "normal",
        cursor: available ? "pointer" : "default",
      }}
    >
      <img src={image} alt={label} />
      <br />
      <div>{label}</div>
      <small>{((population ?? 0) * 0.000001).toFixed(2)}M</small>
    </CountryListItem>
  </Html>
);

export default NearbyCountries;
