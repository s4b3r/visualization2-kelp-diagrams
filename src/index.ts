import './style.css';

import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import { Voronoi } from './voronoi';
import { WorldTexture } from './world';
import { Linking } from './linking';
import { Data, I2DCountryData, I3DCountryData } from './data';
import * as rawdata from '../data.json';
import { Dijkstra } from './dijkstra';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xF );
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls( camera, renderer.domElement);
controls.update();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const lightAmbient = new THREE.AmbientLight( 0x404040 ); 
lightAmbient.intensity = 4;
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

const imageWidth = 1200;
const imageHeight = 800;
const voronoi = new Voronoi(imageWidth, imageHeight);
const linking = new Linking(scene, 4.5);

// Collect the data
const data = new Data(rawdata, 4.5, imageWidth, imageHeight)

const wireframeToggle = document.getElementById('wireframe');
wireframeToggle.addEventListener('click', function(value) {
  if ((<any>wireframeToggle).checked) {
    worldAlbedoMaterial.wireframe = true;
  } else {
    worldAlbedoMaterial.wireframe = false;
  }
});

var checkboxes = document.querySelectorAll("input[type=checkbox]");
let enabledSettings = []

let dijkstra = new Dijkstra()

checkboxes.forEach(function(checkbox) {
  checkbox.addEventListener('change', function() {
    enabledSettings = 
      Array.from(checkboxes)
      .filter(i => (<any>i).checked)
      .map(i => (<any>i).value)
    linking.clear();
    enabledSettings.forEach(enabledSet => {
      switch(enabledSet) {
        case 'EU': {
          voronoi.createVoronoi(data.eu_2d, "rgb(255,0,100)");
          linking.createLinksForSet(dijkstra.mapToDijkstra(data.eu_3d), new THREE.Color( 1.00, 0.00, 0.392 ), 1);
          break;
        }
        case 'NATO': {
          break;
        }
        case 'schengen': {
          break;
        }
        case 'wto': {
          break;
        }
        case 'uncfcc': {
          voronoi.createVoronoi(data.uncfcc_2d, "rgb(255, 255, 100)");
          linking.createLinksForSet(dijkstra.mapToDijkstra(data.uncfcc_3d), new THREE.Color( 1, 1, 0.392 ), 1.1);
          break;
        }
      }
    });
    voronoi.voronoiToCanvas();
  })
});

animate();
