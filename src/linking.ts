import * as THREE from 'three';
import * as d3 from 'd3';

import { I3DCountryDijkstraData } from './dijkstra';

export class Linking {

    scene: THREE.Scene;
    radius: number;
    links: THREE.Group

    constructor(scene: THREE.Scene, radius: number) {
        this.scene = scene;
        this.radius = radius;
        this.links = new THREE.Group();
        this.scene.add(this.links)
    }

    clear() {
        this.links.remove(...this.links.children);
    }

    createLinksForSet(datapoints3d: I3DCountryDijkstraData[], color: THREE.Color, altitude: number): void {
        for (let i = 0; i < datapoints3d.length - 1; i++) {
            const indexConnectedPoint = datapoints3d[i].descendent;
            console.log(indexConnectedPoint)
            this.createTube(datapoints3d[i], datapoints3d[indexConnectedPoint], color, altitude);
        }
    }

    createTube(startpoint: I3DCountryDijkstraData, endpoint: I3DCountryDijkstraData, color: THREE.Color, altitude: number): void {
            const start = new THREE.Vector3(startpoint.x, startpoint.y, startpoint.z);
            const end = new THREE.Vector3(endpoint.x, endpoint.y, endpoint.z);
    
            const clamp = (num, min, max) => (num <= min ? min : num >= max ? max : num);
            var geoInterpolator = d3.geoInterpolate(
                [startpoint.longitude, startpoint.latitude],
                [endpoint.longitude, endpoint.latitude]);
    
            const midCoord1 = geoInterpolator(0.25);
            const midCoord2 = geoInterpolator(0.75);
    
            const mid1 = this.coordinateToPosition(
                midCoord1[1],
                midCoord1[0],
                this.radius + altitude
            );
            const mid2 = this.coordinateToPosition(
                midCoord2[1],
                midCoord2[0],
                this.radius + altitude
            );
    
            var curve = new THREE.CubicBezierCurve3(start, mid1, mid2, end);
            var g = new THREE.TubeGeometry(curve, 100, 0.02, 10, false);
            var m = new THREE.MeshBasicMaterial({
                color: color
            });
            this.links.add(new THREE.Mesh(g, m));
    }

    coordinateToPosition(lat, lng, radius) {
        const phi = (90 - lat) * Math.PI / 180;
        const theta = (lng + 180) * Math.PI / 180;
      
        return new THREE.Vector3(
            -radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
    }
}