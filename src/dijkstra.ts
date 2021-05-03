import { I3DCountryData } from './data';

export interface I3DCountryDijkstraData extends I3DCountryData {
    distance: number
    descendent: number
}

export class Dijkstra {

    visited: number[];
    datapoints3DDijkstra: I3DCountryDijkstraData[];

    constructor() {}

    initializePoints(datapoints3d: I3DCountryData[]): I3DCountryDijkstraData[] {
        this.visited = [];
        let datapoints3DDijkstra: I3DCountryDijkstraData[] = [];
        datapoints3d.forEach((datapoint) => {
            let datapoint3DDijkstra_: I3DCountryDijkstraData = Object.assign(
                {},
                datapoint,
                {distance: Infinity, descendent: -1}
            );
            datapoints3DDijkstra.push(datapoint3DDijkstra_);
        });
        datapoints3DDijkstra[0].distance = 0;
        datapoints3DDijkstra[0].descendent = 0;
        return datapoints3DDijkstra;
    }

    getDistance(datapoints1: I3DCountryData, datapoints2: I3DCountryData) : number {
        return Math.sqrt(Math.pow((datapoints1.x - datapoints2.x), 2) + Math.pow((datapoints1.y - datapoints2.y), 2) + Math.pow((datapoints1.z - datapoints2.z), 2))
    }

    mapToDijkstra(datapoints3d: I3DCountryData[]): I3DCountryDijkstraData[] {
        this.datapoints3DDijkstra = this.initializePoints(datapoints3d);
        this.dijkstra(0);
        return this.datapoints3DDijkstra;
    }

    dijkstra(idxStart: number)
    {
        if (this.visited.length <= this.datapoints3DDijkstra.length) {
            let minDistance = Infinity
            let index = 0
            let distance = Infinity
            this.visited.push(idxStart)
            this.datapoints3DDijkstra.forEach((datapointEnd, idxEnd) => {
                if (!(this.visited.includes(idxEnd))) {
                    distance = this.getDistance(this.datapoints3DDijkstra[idxStart], datapointEnd)
                    // store the distance if it is smaller as the current one
                    if (distance < this.datapoints3DDijkstra[idxEnd].distance) {
                        this.datapoints3DDijkstra[idxEnd].distance = distance;
                        this.datapoints3DDijkstra[idxEnd].descendent = idxStart;
                    }
                    // save the minimal distance to get the next starting point for daikstra
                    if (distance < minDistance) {
                        minDistance = distance;
                        index = idxEnd;
                    }
                }
            })
            this.dijkstra(index);
        }
    }

}