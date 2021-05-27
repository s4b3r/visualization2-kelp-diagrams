// world.ts
/**
 * World texture class, adds the world image and the borders in to the canvas. Uses topojson for creating the borders 
 * @module world.ts
 * 
 */
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { setWorldAlbedoTexture, setCountryBordersTexture } from './index';

export class WorldTexture {

    constructor() {
    }

    createAlbedoImage() {
        const worldMapImage = document.createElement("img");
        worldMapImage.src = 'assets/world2.jpg';
        const canvas = d3
            .select("body")
            .append("canvas")
            .attr("width", 1200)
            .attr("height", 800);
        const context = canvas.node().getContext("2d");
        const that = this;
        worldMapImage.onload = function() {
            context.drawImage(worldMapImage, 0, 0, 1200, 800);
            setWorldAlbedoTexture(canvas.node());
            canvas.remove();
        }
    }


    createCountryBordersImage() {
        const canvas = d3
            .select("body")
            .append("canvas")
            .attr("width", 2048)
            .attr("height", 1024);
        const context = canvas.node().getContext("2d");
        const projection = d3
            .geoEquirectangular()
            .translate([1024, 512])
            .scale(326);
        d3.json("assets/world.json")
            .then(function(data) {
                const countries = topojson.feature(data, data.objects.countries);
                context.strokeStyle = "black";
                context.lineWidth = 0.8;
                context.fillStyle = "transparent";
                context.beginPath();
                const path = d3
                    .geoPath()
                    .projection(projection)
                    .context(context);
                path(countries);
                context.fill();
                context.stroke();
                setCountryBordersTexture(canvas.node());
                canvas.remove();
            }
        ).catch(function(error) {
                // Do some error handling.
                console.log('ERROR')
            }
        );
    }
}
