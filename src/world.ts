import * as d3 from 'd3';
import * as topojson from 'topojson';
import { setWorldTexture } from './index';

export class WorldTexture {
    private width = 2048;
    private height = 1024;

    constructor() {
    }

    createAlbedoImage() {
        
    }


    createCountryBordersImage() {
        const canvas = d3
            .select("body")
            .append("canvas")
            .attr("width", this.width)
            .attr("height", this.height);
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
                setWorldTexture(canvas.node());
                canvas.remove();
            }
        ).catch(function(error) {
                // Do some error handling.
                console.log('ERROR')
            }
        );
    }
}
