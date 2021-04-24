
interface ICountryData {
    country_code: string
    country: string
    latitude: number
    longitude: number
    in_eu: boolean
    in_uncfcc: boolean
}

export interface I3DCountryData extends ICountryData {
    x: number
    y: number
    z: number
}

export interface I2DCountryData extends ICountryData {
    x: number
    y: number
}


export class Data {
    // define variables
    data: ICountryData[]
    eu_countries: ICountryData[]
    uncfcc: ICountryData[]
    eu_3d: I3DCountryData[]
    eu_2d: I2DCountryData[]
    uncfcc_3d: I3DCountryData[]
    uncfcc_2d: I2DCountryData[]

    constructor(data: ICountryData[], radius: number, imageWidth: number, imageHeight: number) {
        this.data = data;
        this.eu_countries = this.data.filter((country) => country.in_eu)
        this.uncfcc = this.data.filter((country) => country.in_uncfcc)
        this.eu_3d = this.eu_countries.map((country) => this.mapTo3D(country, radius))
        this.eu_2d = this.eu_countries.map((country) => this.mapTo2D(country, imageWidth, imageHeight))
        this.uncfcc_3d = this.uncfcc.map((country) => this.mapTo3D(country, radius))
        this.uncfcc_2d = this.uncfcc.map((country) => this.mapTo2D(country, imageWidth, imageHeight))
    }   
    
    mapTo3D(datapoints: ICountryData, radius: number): I3DCountryData {
        let datapoints3D = <I3DCountryData>datapoints;
        var x = -(
            radius *
            Math.sin((90 - datapoints.latitude) * (Math.PI / 180)) *
            Math.cos((datapoints.longitude + 180) * (Math.PI / 180))
        );
        var y = radius * Math.cos((90 - datapoints.latitude) * (Math.PI / 180));
        var z = radius *
            Math.sin((90 - datapoints.latitude) * (Math.PI / 180)) *
            Math.sin((datapoints.longitude + 180) * (Math.PI / 180));
        datapoints3D.x = x;
        datapoints3D.y = y;
        datapoints3D.z = z;
        return datapoints3D;
    }

    mapTo2D(datapoint: ICountryData, imageWidth: number, imageHeight: number): I2DCountryData {
        let datapoints2D = <I2DCountryData>datapoint;
        const x =  ((imageWidth/360.0) * (180 + datapoint.longitude));
        const y =  ((imageHeight/180.0) * (90 - datapoint.latitude));
        datapoints2D.x = x;
        datapoints2D.y = y;
        return datapoints2D;
    }
}