import { CanvasTexture } from "three";
import { Color, DoubleSide, Mesh, Object3D } from "three";
import { MeshPhongMaterial, SphereGeometry } from "three";
import { ClampToEdgeWrapping, LinearMipMapLinearFilter } from "three";

import {
  createContext2D,
  toUint8Array,
  loadAsContext2D,
} from "../../utils/canvas";

import { loadTexture } from "../../utils/textures";

class EarthD3D {
  idx: number;
  path: string;
  //
  mesh: Mesh = new Mesh();
  mesh_lines: Object3D = new Object3D();
  mesh_cloud: Mesh = new Mesh();
  //
  is_rotating: boolean = false;
  //
  constructor(idx: number, init_on_create: boolean = false, path: string = "") {
    this.idx = idx;
    this.path = path;
    //
    if (init_on_create) {
      this.init();
    }
  }
  //
  init = async (scene?: THREE.Scene) => {
    const { mesh_earth, mesh_cloud } = await this.create_earth();
    //
    this.mesh_cloud = mesh_cloud;
    this.mesh = mesh_earth;
    //
    mesh_earth.rotation.y = 0;
    //
    this.is_rotating = true;
    //
    scene?.add(mesh_earth); // place mesh once scene has been initialized
    //
    return mesh_earth; // consider returnining instance reference
  };
  //
  create_earth = async () => {
    const mat_earth = await this.create_earth_material();
    const mat_cloud = await this.create_cloud_material();
    //
    const geo_earth = new SphereGeometry(1, 128, 128);
    const geo_clouds = new SphereGeometry(1.016, 32, 32);
    //
    const mesh_earth = new Mesh(geo_earth, mat_earth);
    const mesh_cloud = new Mesh(geo_clouds, mat_cloud);
    const mesh_lines = new Object3D();
    //
    mesh_earth.name = "earth";
    mesh_cloud.name = "cloud";
    //
    mesh_earth.add(mesh_cloud);
    mesh_earth.add(mesh_lines);
    //
    this.mesh_lines = mesh_lines;
    this.mesh_lines.rotation.y = Math.PI / 2;
    //
    return { mesh_earth, mesh_cloud };
  };
  //
  create_earth_material = async () => {
    const mat_earth = new MeshPhongMaterial();
    //
    const { diffuse_map, normal_map, specular_map, displacement_map } =
      await this.init_textures_earth();
    //
    mat_earth.map = diffuse_map;
    mat_earth.normalMap = normal_map;
    mat_earth.specularMap = specular_map;
    mat_earth.specular = new Color("grey");
    mat_earth.displacementMap = displacement_map;
    mat_earth.displacementScale = 0.055;
    //
    return mat_earth;
  };
  //
  create_cloud_material = async () => {
    return new MeshPhongMaterial({
      map: await this.init_textures_clouds(),
      side: DoubleSide,
      opacity: 0.8,
      transparent: true,
      depthWrite: false,
    });
  };
  //
  init_textures_earth = async () => {
    const p = `${this.path ?? process.env.PUBLIC_URL}data/earth/`;
    //
    const diffuse_map = await loadTexture(`${p}_test_world_16bpp_32x_for.png`);
    //
    const normal_map = await loadTexture(`${p}normal3.png`);
    const specular_map = await loadTexture(`${p}specular.jpg`);
    const displacement_map = await loadTexture(`${p}bump.jpg`);
    //
    displacement_map.generateMipmaps = true;
    displacement_map.minFilter = LinearMipMapLinearFilter;
    displacement_map.magFilter = LinearMipMapLinearFilter;
    //
    return { diffuse_map, normal_map, specular_map, displacement_map };
  };
  //
  init_textures_clouds = async () => {
    const p = `${this.path ?? process.env.PUBLIC_URL}data/earth/`;
    //
    const w = 1024;
    const h = 512;
    //
    let cloud_diffuse = await loadAsContext2D(`${p}cloud1.jpg`, 1024, 512);
    let cloud_alpha = await loadAsContext2D(`${p}cloud2.jpg`, 1024, 512);
    //
    const idata =
      cloud_diffuse?.getImageData(0, 0, w, h) ?? new ImageData(0, 0);
    const data8 = new Uint8Array(idata.data.buffer);
    const data8alpha = cloud_alpha
      ? toUint8Array(cloud_alpha, w, h)
      : new Uint8Array(0);
    //
    // now after both the diffuse and the alpha map is present we load the image and apply the mask to it
    //
    let i = 0,
      len = data8.length; //CONV. STEP: move a component channel to alpha-channel
    //
    while (i < len) {
      data8[i + 3] = Math.floor(0.75 * (255 - data8alpha[i]));
      i += 4;
    }
    //
    const ctx = createContext2D(w, h, "#ffffff");
    ctx?.putImageData(idata, 0, 0); // update canvas after alpha changed
    //
    const c_texture =
      ctx && ctx.canvas
        ? new CanvasTexture(ctx.canvas)
        : new CanvasTexture(new ImageBitmap());
    //
    c_texture.wrapS = ClampToEdgeWrapping;
    c_texture.wrapT = ClampToEdgeWrapping;
    //
    return c_texture;
  };
  //
  animate = (elapsed: number) => {
    const is_ready = this.is_rotating && this.mesh && this.mesh_cloud;
    //
    if (is_ready) {
      this.mesh_cloud.rotation.y += (1 / 25) * elapsed;
      this.mesh.rotation.y += (1 / 32) * elapsed;
    }
  };
}

export default EarthD3D;
