import * as d3 from 'd3';
import { setVoronoiTexture } from './index';
import { Library } from '@observablehq/notebook-stdlib';

export class VoronoiTexture {
    private width = 1200;
    private height = 800;
    private radius = 20;

    private svg;
    private canvas;
    private datapoints;

    private worldMapImage;
    private voronoiImage;

    private library = new Library();

    constructor() {
    }

    createImage(): void {
        this.createVoronoi();
        this.worldMapToCanvas();
        this.voronoiToCanvas();
    }
    
    createVoronoi(): void {
        this.svg = d3.select("body").append("svg")
        .attr("viewBox", [0, 0, this.width, this.height])
        .attr("stroke-width", 2);

        this.datapoints = d3.range(20).map(i => ({
            x: Math.random() * (this.width - this.radius * 2) + this.radius,
            y: Math.random() * (this.height - this.radius * 2) + this.radius,
        }));

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

    worldMapToCanvas() {
        this.worldMapImage = document.createElement("img");
        this.worldMapImage.src = 'assets/world2.jpg';
        const that = this;
        this.worldMapImage.onload = function() {
            that.draw();
        }
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
        context.fillStyle = "#fff";
        context.fillRect(0, 0, this.width, this.height);
        context.drawImage(this.worldMapImage, 0, 0, this.width, this.height);
        context.drawImage(this.voronoiImage, 0, 0, this.width, this.height);
        setVoronoiTexture(this.canvas.node());
        this.canvas.remove();
        this.svg.remove();
    }
}
