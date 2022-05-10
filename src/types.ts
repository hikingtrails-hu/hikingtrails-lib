export interface Point {
    lat: number
    lon: number
    elevation: number
}

export interface Path {
    points: Point[]
}

export interface HikingTrail {
    name: string
    path: Path
    sectionEndpoints: SectionEndpoint[]
}

export interface FittingOnPath {
    pointIdx: number
}

export interface Stamp extends FittingOnPath{
    name: string
    description: string
    position: Point
    distanceFromNext: number | null
}

export interface SectionEndpoint {
    name: string
    stamps: Stamp[]
}

export namespace Loading {

    export interface RawData {
        path: Path
        rawStampData: RawStampData[]
    }

    export interface StampOnPathData extends Omit<RawData, 'rawStampData'> {
        stampsOnPath: StampOnPath[]
    }

    export interface StampData extends Omit<RawData, 'rawStampData'> {
        stamps: Stamp[]
    }

    export type RawStampData = Omit<Stamp, 'distanceFromNext' | 'pointIdx'>

    export type StampOnPath= Omit<Stamp, 'distanceFromNext'>

}
