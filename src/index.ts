import './style.css';

import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

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

const world = new THREE.Mesh(
  new THREE.SphereGeometry(4.5, 40, 40),
  new THREE.MeshPhongMaterial({
    map: THREE.ImageUtils.loadTexture('assets/world2.jpg'),
})
);

scene.add(world);

camera.position.x = 5;
camera.position.y = 5;
camera.position.z = 5;

camera.lookAt(scene.position);

function animate(): void {
  requestAnimationFrame(animate);
  render();
  controls.update();
}

function render(): void {
  //controls.update();
  renderer.render(scene, camera);
}

animate();
