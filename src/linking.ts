// linking.ts
/**
 * Class for the links between dots (countries)
 * @module linking.ts
 */
import * as THREE from 'three';
import * as d3 from 'd3';
import { I3DCountryDijkstraData } from './dijkstra';

/**
 *  creates links for countries belonging in a set of organizations
 */
export class Linking {

    scene: THREE.Scene;
    radius: number;
    links: THREE.Group
/**
 * constructor for the class, which initializes the links as a new Three.js group.
 * @param scene Three.js scene
 * @param radius radius of the datapoints
 */
    constructor(scene: THREE.Scene, radius: number) {
        this.scene = scene;
        this.radius = radius;
        this.links = new THREE.Group();
        this.scene.add(this.links)
    }

    clear() {
        this.links.remove(...this.links.children);
    }

    /**
     * Create links between datapoints belonging in a set
     * @param datapoints3d 
     * @param color 
     * @param altitude 
     */
    createLinksForSet(datapoints3d: I3DCountryDijkstraData[], color: THREE.Color, altitude: number): void {
        for (let i = 0; i < datapoints3d.length; i++) {
            const indexConnectedPoint = datapoints3d[i].descendent;
            this.createTube(datapoints3d[i], datapoints3d[indexConnectedPoint], color, altitude);
        }
    }

    /**
     * Creates the Three.js vectors, i.e tubes, that curve between the datapoints belonging into a same set
     * @param startpoint 
     * @param endpoint 
     * @param color 
     * @param altitude 
     */
    createTube(startpoint: I3DCountryDijkstraData, endpoint: I3DCountryDijkstraData, color: THREE.Color, altitude: number): void {
            altitude = altitude * this.getDistance(startpoint, endpoint) / 4;
            const start = new THREE.Vector3(startpoint.x, startpoint.y, startpoint.z);
            const end = new THREE.Vector3(endpoint.x, endpoint.y, endpoint.z);
    
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
/**
 * Corrects the coordinate into correct positions in the Three.js scene
 * @param lat 
 * @param lng 
 * @param radius 
 * @returns 
 */
    coordinateToPosition(lat, lng, radius) {
        const phi = (90 - lat) * Math.PI / 180;
        const theta = (lng + 180) * Math.PI / 180;
      
        return new THREE.Vector3(
            -radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
    }
/**
 * Returns the distance between two datapoints
 * @param datapoints1 
 * @param datapoints2 
 * @returns 
 */
    getDistance(datapoints1: I3DCountryDijkstraData, datapoints2: I3DCountryDijkstraData) : number {
        return Math.sqrt(Math.pow((datapoints1.x - datapoints2.x), 2) + Math.pow((datapoints1.y - datapoints2.y), 2) + Math.pow((datapoints1.z - datapoints2.z), 2))
    }
}