import * as d3 from 'd3';
import * as THREE from 'three';

import { setVoronoiTexture } from './index';
import { Library } from '@observablehq/notebook-stdlib';

import { I2DCountryData } from './data';


export class Voronoi {
    private width = 1200;
    private height = 800;
    private radius = 10;

    private svg;
    private canvas;

    private voronoiImage;

    private library = new Library();

    constructor(imageWidth, imageHeight) {
        this.width = imageWidth;
        this.height = imageHeight;
    }

    createImage(datapoints2d: I2DCountryData[]): void {
        this.createVoronoi(datapoints2d);
        this.voronoiToCanvas();
    }
    
    createVoronoi(datapoints2d: I2DCountryData[]): void {
        this.svg = d3.select("body").append("svg")
        .attr("viewBox", [0, 0, this.width, this.height])
        .attr("stroke-width", 2);

        const voronoi = d3.Delaunay
            .from(datapoints2d, d => d.x, d => d.y)
            .voronoi([0, 0, this.width, this.height]);

        const cell = this.svg.append("defs")
            .selectAll("clipPath")
            .data(datapoints2d)
            .join("clipPath")
                .attr("id", (d, i) => (d.id = this.library.DOM.uid("cell").id))
                .append("path")
                .attr("d", (d, i) => voronoi.renderCell(i));

        const circle = this.svg.append("g")
            .selectAll("g")
            .data(datapoints2d)
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
