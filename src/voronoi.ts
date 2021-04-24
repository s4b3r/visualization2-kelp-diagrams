import * as d3 from 'd3';
import { setVoronoiTexture } from './index';
import { Library } from '@observablehq/notebook-stdlib';

import * as THREE from 'three';

export class Voronoi {
    private width = 1200;
    private height = 800;
    private radius = 20;
    private sphereRadius = 4.5;

    private scene;

    private svg;
    private canvas;
    private datapoints;

    private voronoiImage;

    private library = new Library();

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    createImage(): void {
        this.createVoronoi();
        this.voronoiToCanvas();
        this.createTubes(this.mapDataPoints3D());
    }

    mapDataPoints2D(): { id: number, name: string }[] {
        // this method needs to consume the datapoints of our dataset and map it to the canvas
        return this.datapoints = d3.range(20).map(i => ({
            x: Math.random() * (this.width - this.radius * 2) + this.radius,
            y: Math.random() * (this.height - this.radius * 2) + this.radius,
        }));
    }

    mapDataPoints3D(): { origin: any, destination: any }[] {
        return [
            {
              origin: { name: "Bogotá", latitude: 4.624335, longitude: -74.063644 },
              destination: { name: "Jamaica", latitude: 22.97917, longitude: -82.17028 }
            },
            {
              origin: { name: "Jamaica", latitude: 22.97917, longitude: -82.17028 },
              destination: { name: "Miami", latitude: 25.761681, longitude: -80.191788 }
            },
            {
              origin: { name: "Jamaica", latitude: 22.97917, longitude: -82.17028 },
              destination: { name: "New York", latitude: 40.73061, longitude: -73.935242 }
            },
            {
              origin: { name: "Jamaica", latitude: 22.97917, longitude: -82.17028 },
              destination: { name: "Britain", latitude: 51.509865, longitude: -0.118092 }
            },
            {
              origin: { name: "New York", latitude: 40.73061, longitude: -73.935242 },
              destination: { name: "Britain", latitude: 51.509865, longitude: -0.118092 }
            }
          ];
          
    }
    
    createVoronoi(): void {
        this.svg = d3.select("body").append("svg")
        .attr("viewBox", [0, 0, this.width, this.height])
        .attr("stroke-width", 2);

        const voronoi = d3.Delaunay
            .from(this.datapoints, d => d.x, d => d.y)
            .voronoi([0, 0, this.width, this.height]);

        const cell = this.svg.append("defs")
            .selectAll("clipPath")
            .data(this.datapoints)
            .join("clipPath")
                .attr("id", (d, i) => (d.id = this.library.DOM.uid("cell").id))
                .append("path")
                .attr("fake", (d, i) => console.log(i))
                .attr("d", (d, i) => voronoi.renderCell(i));

        const circle = this.svg.append("g")
            .selectAll("g")
            .data(this.datapoints)
            .join("g")
            .attr("clip-path", d => "url(#" + d.id + ")")
            .append("g")
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .call(g => g.append("circle")
                .attr("r", this.radius)
                .attr("fill", (d, i) => d3.schemeCategory10[i % 10]))
            .call(g => g.append("circle")
                .attr("r", 2.5));
    }

    createTubes(array): void {
        array.map((d, i) => {
            //convert lng & lat coordinates to 3d space
            var startLat = d.origin.latitude;
            var startLng = d.origin.longitude;
    
            var endLat = d.destination.latitude;
            var endLng = d.destination.longitude;
    
            var x = -(
                this.sphereRadius *
                Math.sin((90 - startLat) * (Math.PI / 180)) *
                Math.cos((startLng + 180) * (Math.PI / 180))
            );
            var z = this.sphereRadius *
                Math.sin((90 - startLat) * (Math.PI / 180)) *
                Math.sin((startLng + 180) * (Math.PI / 180));
            var y = this.sphereRadius * Math.cos((90 - startLat) * (Math.PI / 180));
    
            var x2 = -(
                this.sphereRadius *
                Math.sin((90 - endLat) * (Math.PI / 180)) *
                Math.cos((endLng + 180) * (Math.PI / 180))
            );
            var z2 =
                this.sphereRadius *
                Math.sin((90 - endLat) * (Math.PI / 180)) *
                Math.sin((endLng + 180) * (Math.PI / 180));
            var y2 = this.sphereRadius * Math.cos((90 - endLat) * (Math.PI / 180));
    
            //store the starting and ending positions of each location
            var start = new THREE.Vector3(x, y, z);
            var end = new THREE.Vector3(x2, y2, z2);
    
            //https://medium.com/@xiaoyangzhao/drawing-curves-on-webgl-globe-using-three-js-and-d3-draft-7e782ffd7ab
            const CURVE_MIN_ALTITUDE = 1;
            const CURVE_MAX_ALTITUDE = 2;
            const clamp = (num, min, max) => (num <= min ? min : num >= max ? max : num);
            const altitude = clamp(
                start.distanceTo(end) * 0.75,
                CURVE_MIN_ALTITUDE,
                CURVE_MAX_ALTITUDE
            );
    
            //get the middle position of each location
            var lat = [startLng, startLat];
            var lng = [endLng, endLat];
            var geoInterpolator = d3.geoInterpolate(lat, lng);
    
            const midCoord1 = geoInterpolator(0.25);
            const midCoord2 = geoInterpolator(0.75);
    
            const mid1 = this.coordinateToPosition(
                midCoord1[1],
                midCoord1[0],
                this.sphereRadius + altitude
            );
            const mid2 = this.coordinateToPosition(
                midCoord2[1],
                midCoord2[0],
                this.sphereRadius + altitude
            );
    
            //create bezier curve from the lng & lat positions
            var curve = new THREE.CubicBezierCurve3(start, mid1, mid2, end);
            var g = new THREE.TubeGeometry(curve, 100, 0.05, 10, false);
            var m = new THREE.MeshBasicMaterial({
                color: new THREE.Color(
                "hsl(" + Math.floor(Math.random() * 360) + ",50%,50%)"
                )
            });
            this.scene.add(new THREE.Mesh(g, m));
        });
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

    voronoiToCanvas() {
        this.canvas = d3
            .select("body")
            .append("canvas")
            .attr("width", this.width)
            .attr("height", this.height);

        const svgNode = this.svg.node();
        const svgData = (new XMLSerializer()).serializeToString(svgNode);

        this.voronoiImage = document.createElement("img");
        this.voronoiImage.setAttribute("src", "data:image/svg+xml;base64," + window.btoa(unescape(encodeURIComponent(svgData))) );
        const that = this;
        this.voronoiImage.onload = function() {
            that.draw();
        }    
    }

    draw() {
        const context = this.canvas.node().getContext("2d");
        context.drawImage(this.voronoiImage, 0, 0, this.width, this.height);
        setVoronoiTexture(this.canvas.node());
        this.canvas.remove();
        this.svg.remove();
    }
}
