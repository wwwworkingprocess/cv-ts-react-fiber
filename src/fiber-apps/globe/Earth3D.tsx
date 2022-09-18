import * as THREE from "three";

import tfs from "../../utils/textures";
import cu from "../../utils/canvasutils";

class EarthD3D {
  idx: number;
  //
  mesh: THREE.Mesh = new THREE.Mesh();
  mesh_lines: THREE.Object3D = new THREE.Object3D();
  mesh_cloud: THREE.Mesh = new THREE.Mesh();
  uniforms: any; // no uniforms here
  //
  is_rotating: boolean = false;
  //
  constructor(idx: number, init_on_create: boolean = false) {
    this.idx = idx;
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
    const mat_earth = await this.create_earth_material(),
      mat_cloud = await this.create_cloud_material();
    //
    const geo_earth = new THREE.SphereGeometry(1, 128, 128),
      geo_clouds = new THREE.SphereGeometry(1.016, 32, 32);
    const mesh_earth = new THREE.Mesh(geo_earth, mat_earth),
      mesh_cloud = new THREE.Mesh(geo_clouds, mat_cloud);
    const mesh_lines = new THREE.Object3D();
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
    const mat_earth = new THREE.MeshPhongMaterial();
    //
    const { diffuse_map, normal_map, specular_map, displacement_map } =
      await this.init_textures_earth();
    //
    mat_earth.map = diffuse_map;
    mat_earth.normalMap = normal_map;
    mat_earth.specularMap = specular_map;
    mat_earth.specular = new THREE.Color("grey");
    mat_earth.displacementMap = displacement_map;
    mat_earth.displacementScale = 0.055;
    //
    return mat_earth;
  };
  //
  create_cloud_material = async () => {
    return new THREE.MeshPhongMaterial({
      map: await this.init_textures_clouds(),
      side: THREE.DoubleSide,
      opacity: 0.8,
      transparent: true,
      depthWrite: false,
    });
  };
  //
  init_textures_earth = async () => {
    const diffuse_map: THREE.Texture = await tfs.load_from_url(
      process.env.PUBLIC_URL + "data/earth/_test_world_16bpp_32x_for.png"
    );

    const normal_map: THREE.Texture = await tfs.load_from_url(
      process.env.PUBLIC_URL + "data/earth/normal3.png"
    );
    const specular_map: THREE.Texture = await tfs.load_from_url(
      process.env.PUBLIC_URL + "data/earth/specular.jpg"
    );
    const displacement_map: THREE.Texture = await tfs.load_from_url(
      process.env.PUBLIC_URL + "data/earth/bump.jpg"
    );
    //
    displacement_map.generateMipmaps = true;
    displacement_map.minFilter = THREE.LinearMipMapLinearFilter;
    displacement_map.magFilter = THREE.LinearMipMapLinearFilter;
    //
    return { diffuse_map, normal_map, specular_map, displacement_map };
  };
  //
  init_textures_clouds = async () => {
    const w = 1024,
      h = 512;
    //
    let cloud_diffuse = await cu.load_img_as_context(
      "data/earth/cloud1.jpg",
      1024,
      512
    );
    let cloud_alpha = await cu.load_img_as_context(
      "data/earth/cloud2.jpg",
      1024,
      512
    );
    //
    const idata =
      cloud_diffuse?.getImageData(0, 0, w, h) ?? new ImageData(0, 0);
    const data8 = new Uint8Array(idata.data.buffer);
    const data8alpha = cloud_alpha
      ? cu.get_context_as_uint8_array(cloud_alpha, w, h)
      : new Uint8Array(0); // new Uint8Array(idataalpha.data.buffer);
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
    const ctx = cu.create_empty_context(w, h, "#ffffff");
    ctx?.putImageData(idata, 0, 0); // update canvas after alpha changed
    //
    const c_texture =
      ctx && ctx.canvas
        ? new THREE.CanvasTexture(ctx.canvas)
        : new THREE.CanvasTexture(new ImageBitmap());
    //
    c_texture.wrapS = THREE.ClampToEdgeWrapping;
    c_texture.wrapT = THREE.ClampToEdgeWrapping;
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
