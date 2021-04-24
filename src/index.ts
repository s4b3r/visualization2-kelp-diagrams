import './style.css';

import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import { Voronoi } from './voronoi';
import { WorldTexture } from './world';

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xE6E6FF );
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls( camera, renderer.domElement);
controls.update();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const lightDirectional = new THREE.DirectionalLight(0xffffff, 1.0);
lightDirectional.position.set(100, 100, 100);
scene.add(lightDirectional);
const lightAmbient = new THREE.AmbientLight( 0x404040 ); 
scene.add(lightAmbient);

// Create sphere for voronoi projection
const voronoiMaterial = new THREE.MeshPhongMaterial({
  map: THREE.ImageUtils.loadTexture('assets/world2.jpg'),
  transparent : true,
  opacity: 1,
  blending: THREE.AdditiveAlphaBlending,
  side: THREE.DoubleSide
});
voronoiMaterial.map.minFilter = THREE.LinearFilter;

const voronoiSphere = new THREE.Mesh(
  new THREE.SphereGeometry(4.5, 100, 100),
  voronoiMaterial
);

scene.add(voronoiSphere);

// Create sphere with country borders
const worldBordersMaterial = new THREE.MeshPhongMaterial({
  map: THREE.ImageUtils.loadTexture('assets/world2.jpg'),
  transparent : true,
  opacity: 0.7,
  blending: THREE.AdditiveAlphaBlending
});
voronoiMaterial.map.minFilter = THREE.LinearFilter;

const worldBordersSphere = new THREE.Mesh(
  new THREE.SphereGeometry(4.51, 100, 100),
  worldBordersMaterial
);

scene.add(worldBordersSphere);

// Create sphere with world texture
const worldAlbedoMaterial = new THREE.MeshPhongMaterial({
  map: THREE.ImageUtils.loadTexture('assets/world2.jpg'),
});
voronoiMaterial.map.minFilter = THREE.LinearFilter;

const worldAlbedoSphere = new THREE.Mesh(
  new THREE.SphereGeometry(4.49, 100, 100),
  worldAlbedoMaterial
);

scene.add(worldAlbedoSphere);

//

camera.position.x = 5;
camera.position.y = 5;
camera.position.z = 5;

camera.lookAt(scene.position);

function setVoronoiTexture(image): void {
  const texture = new THREE.Texture(image);
  texture.needsUpdate = true;
  voronoiMaterial.map = texture;
}

function setWorldAlbedoTexture(image): void {
  const texture = new THREE.Texture(image);
  texture.needsUpdate = true;
  worldAlbedoMaterial.map = texture;
}

function setCountryBordersTexture(image): void {
  const texture = new THREE.Texture(image);
  texture.needsUpdate = true;
  worldBordersMaterial.map = texture;
}

export { setVoronoiTexture, setWorldAlbedoTexture, setCountryBordersTexture };

function animate(): void {
  requestAnimationFrame(animate);
  render();
  controls.update();
}

function render(): void {
  renderer.render(scene, camera);
}

const worldTexture = new WorldTexture();
worldTexture.createAlbedoImage();
worldTexture.createCountryBordersImage();

const voronoi = new Voronoi(scene);
// do we need these datapoints outside of the voronoi class?
const datapoints = voronoi.mapDataPoints2D()
voronoi.createImage();

const wireframeToggle = document.getElementById('wireframe');
wireframeToggle.addEventListener('click', function(value) {
  if ((<any>wireframeToggle).checked) {
    worldAlbedoMaterial.wireframe = true;
  } else {
    worldAlbedoMaterial.wireframe = false;
  }
});

animate();
