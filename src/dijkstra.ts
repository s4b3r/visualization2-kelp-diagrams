import { I3DCountryData } from './data';

export interface I3DCountryDijkstraData extends I3DCountryData {
    connectedPoint: number
}

export class Dijkstra {

    constructor() {}

    mapToDijkstra(datapoints3d: I3DCountryData[]): I3DCountryDijkstraData[] {
        let datapoints3DDijkstra = this.initializePoints(datapoints3d);
        datapoints3DDijkstra.forEach((datapointStart, idxStart) => {
            let minDistance = Infinity
            let index = 0
            let distance = Infinity
            datapoints3DDijkstra.forEach((datapointEnd, idxEnd) => {
                if (!(idxStart == idxEnd)) {
                    distance = this.getDistance(datapointStart, datapointEnd)
                    if (distance < minDistance) {
                        minDistance = distance;
                        index = idxEnd;
                    }
                }
            })
            if (!(datapoints3DDijkstra[index].connectedPoint == idxStart)) {
                datapointStart.connectedPoint = index;
            }
        })
        return datapoints3DDijkstra;
    }

    initializePoints(datapoints3d: I3DCountryData[]): I3DCountryDijkstraData[] {
        let datapoints3DDijkstra: I3DCountryDijkstraData[] = [];
        datapoints3d.forEach((datapoint) => {
            let datapoint3DDijkstra_: I3DCountryDijkstraData = Object.assign(
                {},
                datapoint,
                {connectedPoint: -1}
            );
            datapoints3DDijkstra.push(datapoint3DDijkstra_);
        });
        return datapoints3DDijkstra;
    }

    getDistance(datapoints1: I3DCountryData, datapoints2: I3DCountryData) : number {
        return Math.sqrt(Math.pow((datapoints1.x - datapoints2.x), 2) + Math.pow((datapoints1.y - datapoints2.y), 2) + Math.pow((datapoints1.z - datapoints2.z), 2))
    }

}