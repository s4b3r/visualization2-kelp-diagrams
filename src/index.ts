import './style.css';

import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import { VoronoiTexture } from './voronoi';
import { WorldTexture } from './world';

const scene = new THREE.Scene();
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
});
voronoiMaterial.map.minFilter = THREE.LinearFilter;

const voronoiSphere = new THREE.Mesh(
  new THREE.SphereGeometry(4.5, 40, 40),
  voronoiMaterial
);

scene.add(voronoiSphere);

// Create sphere for world projection
const worldMaterial = new THREE.MeshPhongMaterial({
  map: THREE.ImageUtils.loadTexture('assets/world2.jpg'),
  transparent : true,
  opacity: 0.7,
  blending: THREE.AdditiveAlphaBlending
});
voronoiMaterial.map.minFilter = THREE.LinearFilter;

const worldSphere = new THREE.Mesh(
  new THREE.SphereGeometry(4.51, 40, 40),
  worldMaterial
);

const quaternion = new THREE.Quaternion();
quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / 2 );
//worldSphere.rotation.x = 0;
//worldSphere.rotation.set(new THREE.Euler().setFromQuaternion( quaternion ));

scene.add(worldSphere);

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

function setWorldTexture(image): void {
  console.log('Came here');
  const texture = new THREE.Texture(image);
  texture.needsUpdate = true;
  worldMaterial.map = texture;
}

export {setVoronoiTexture, setWorldTexture};

function animate(): void {
  requestAnimationFrame(animate);
  render();
  controls.update();
}

function render(): void {
  renderer.render(scene, camera);
}

const worldTexture = new WorldTexture();
worldTexture.createCountryBordersImage();

const voronoiTexture = new VoronoiTexture();
voronoiTexture.createImage();

animate();
