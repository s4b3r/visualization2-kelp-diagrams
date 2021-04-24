import * as THREE from 'three';
import * as d3 from 'd3';

import { I3DCountryData } from './data';

export class Linking {

    scene: THREE.Scene;
    radius: number;

    constructor(scene: THREE.Scene, radius: number) {
        this.scene = scene;
        this.radius = radius;
    }

    createLinksForSet(datapoints3d: I3DCountryData[], color: THREE.Color): void {
        for (let i = 0; i < datapoints3d.length - 1; i++) {
            this.createTube(datapoints3d[i], datapoints3d[i + 1], color);
        }
    }

    createTube(startpoint: I3DCountryData, endpoint: I3DCountryData, color: THREE.Color): void {
        const start = new THREE.Vector3(startpoint.x, startpoint.y, startpoint.z);
        const end = new THREE.Vector3(endpoint.x, endpoint.y, endpoint.z);

        const CURVE_MIN_ALTITUDE = 1;
        const CURVE_MAX_ALTITUDE = 2;
        const clamp = (num, min, max) => (num <= min ? min : num >= max ? max : num);
        const altitude = clamp(
            start.distanceTo(end) * 0.75,
            CURVE_MIN_ALTITUDE,
            CURVE_MAX_ALTITUDE
        );

        const lat = [startpoint.longitude, startpoint.latitude];
        const lng = [endpoint.longitude, endpoint.latitude];
        var geoInterpolator = d3.geoInterpolate(lat, lng);

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
        var g = new THREE.TubeGeometry(curve, 100, 0.05, 10, false);
        var m = new THREE.MeshBasicMaterial({
            color: color
        });
        this.scene.add(new THREE.Mesh(g, m));
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