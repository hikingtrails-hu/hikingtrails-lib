import { strict as assert } from 'assert'
import {
    FittingOnPath,
    Path,
    Point,
    SectionEndpoint,
    Stamp,
    Loading
} from './types'

export type DistanceInMeters = (point1: Point, point2: Point) => number

export type DistanceOnPath = ReturnType<typeof distanceOnPath>

export const distanceOnPath = (distanceInMeters: DistanceInMeters) => (
    path: Path,
    idx1: number,
    idx2: number
): number => {
    assert(idx1 >= 0)
    assert(idx2 >= 0)
    assert(idx1 < path.points.length)
    assert(idx2 < path.points.length)
    const startIdx = Math.min(idx1, idx2)
    const endIdx = Math.max(idx1, idx2)
    let result = 0
    for (let i = startIdx; i < endIdx; ++i) {
        assert(i < path.points.length)
        assert(i >= 0)
        result += distanceInMeters(path.points[i] as Point, path.points[i + 1] as Point)
    }
    return result
}

export type OrderStamps = ReturnType<typeof orderStamps>

export const orderStamps =
    (distanceInMeters: DistanceInMeters) => (
        rawData: Loading.RawData
    ): Loading.StampOnPathData => ({
        stampsOnPath: rawData.rawStampData.map(stamp => {
            let minDistance = Infinity
            let nearestIdx = -1
            rawData.path.points.forEach((point, idx) => {
                const distance = distanceInMeters(point, stamp.position)
                if (distance < minDistance) {
                    minDistance = distance
                    nearestIdx = idx
                }
            })
            return {
                ...stamp,
                pointIdx: nearestIdx
            }
        }).sort(
            (stamp1, stamp2) => stamp1.pointIdx - stamp2.pointIdx
        ),
        path: rawData.path
    })

export type MeasureStamps = ReturnType<typeof measureStamps>

export const measureStamps = (
    distanceOnPath: DistanceOnPath
) => (
    data: Loading.StampOnPathData
): Loading.StampData => ({
    path: data.path,
    stamps: data.stampsOnPath.map((stamp, idx) => ({
        ...stamp,
        distanceFromNext: idx === data.stampsOnPath.length - 1
            ? null
            : distanceOnPath(
                data.path,
                stamp.pointIdx,
                (data.stampsOnPath[idx + 1] as FittingOnPath).pointIdx
            )
    }))
})

export const groupSectionEndpoints = (distanceThreshold: number) => {
    const isSameSectionEndPoint = (
        last: SectionEndpoint,
        current: Stamp
    ): boolean => {
        const distance = [...last.stamps]
            .pop()?.distanceFromNext as number
        return current.name === last.name && distance < distanceThreshold
    }
    return (stamps: Stamp[]): SectionEndpoint[] => {
        const result: SectionEndpoint[] = []
        stamps.forEach(stamp => {
            const last = result[result.length - 1]
            if (last && isSameSectionEndPoint(last, stamp)) {
                last.stamps.push(stamp)
                return
            }
            result.push({
                name: stamp.name,
                stamps: [stamp]
            })
        })
        return result
    }
}

export const orderAndMeasureStamps =
    (distanceInMeters: DistanceInMeters) => (
        rawData: Loading.RawData
    ): Loading.StampData => measureStamps(
        distanceOnPath(distanceInMeters)
    )(orderStamps(distanceInMeters)(rawData))
