import {
    Path, DistanceInMeters, distanceOnPath, measureStamps, orderStamps,
    groupSectionEndpoints, orderAndMeasureStamps, Loading
} from '../src'

describe('Distance on path', () => {
    const path: Path = {
        points: [
            { lat: 0, lon: 0, elevation: 0 },
            { lat: 1, lon: 0, elevation: 0 },
            { lat: 2, lon: 0, elevation: 0 },
            { lat: 3, lon: 0, elevation: 0 }
        ]
    }

    const distanceInMeters: DistanceInMeters =
        (point1, point2) => point2.lat - point1.lat

    const onPath = distanceOnPath(distanceInMeters)

    it('returns 0 for same start and end point', () => {
        const result = onPath(path, 0, 0)
        expect(result).toBeCloseTo(0, 2)
    })

    it('throws error on invalid indexes', () => {
        expect(() => onPath(path, -1, 1)).toThrowError()
        expect(() => onPath(path, 1, -1)).toThrowError()
        expect(() => onPath(path, 5, 1)).toThrowError()
        expect(() => onPath(path, 1, 5)).toThrowError()
    })

    it('returns correct value', () => {
        const result = onPath(path, 3, 1)
        expect(result).toBeCloseTo(2, 2)
    })
})

describe('Order stamping locations on path', () => {
    it('return stamping locations with point on path with correct order', () => {
        const path: Path = {
            points: [
                { lat: 0, lon: 0, elevation: 0 },
                { lat: 1, lon: 0, elevation: 0 },
                { lat: 2, lon: 0, elevation: 0 },
                { lat: 3, lon: 0, elevation: 0 },
                { lat: 4, lon: 0, elevation: 0 }
            ]
        }
        const stamps = [
            {
                name: 'test1',
                description: '',
                position: { lat: 0, lon: 0, elevation: 0 }
            },
            {
                name: 'test2',
                description: '',
                position: { lat: 3.1, lon: 0, elevation: 0 }
            },
            {
                name: 'test3',
                description: '',
                position: { lat: 1.1, lon: 0, elevation: 0 }
            }
        ]
        const distanceInMeters: DistanceInMeters =
            (point1, point2) => Math.abs(point1.lat - point2.lat)
        const result = orderStamps(distanceInMeters)({
            path,
            rawStampData: stamps
        })
        expect(result).toStrictEqual({
            path,
            stampsOnPath: [
                { ...stamps[0], pointIdx: 0 },
                { ...stamps[2], pointIdx: 1 },
                { ...stamps[1], pointIdx: 3 }
            ]
        })
    })
})

describe('Measure stamp distances on path', () => {
    it('measures correctly', () => {
        const measure = measureStamps(
            (path, idx1, idx2) => Math.abs(idx1 - idx2)
        )
        const stamps = [
            {
                name: 'test1',
                description: '',
                position: { lat: 0, lon: 0, elevation: 0 },
                pointIdx: 1
            },
            {
                name: 'test2',
                description: '',
                position: { lat: 0, lon: 0, elevation: 0 },
                pointIdx: 3
            },
            {
                name: 'test3',
                description: '',
                position: { lat: 0, lon: 0, elevation: 0 },
                pointIdx: 10
            }
        ]
        const path = { points: [] }
        const result = measure({
            stampsOnPath: stamps,
            path
        })
        expect(result).toStrictEqual({
            stamps: [
                { ...stamps[0], distanceFromNext: 2 },
                { ...stamps[1], distanceFromNext: 7 },
                { ...stamps[2], distanceFromNext: null }
            ],
            path
        })
    })
})

describe('Calculate section endpoints', () => {
    it('group endpoints by name', () => {
        const stamps = [
            {
                name: 'test1',
                description: '',
                position: { lat: 1, lon: 0, elevation: 0 },
                pointIdx: 1,
                distanceFromNext: 10
            },
            {
                name: 'test1',
                description: '',
                position: { lat: 1, lon: 0.1, elevation: 0 },
                pointIdx: 3,
                distanceFromNext: 12
            },
            {
                name: 'test1',
                description: '',
                position: { lat: 1.5, lon: 0.1, elevation: 0 },
                pointIdx: 4,
                distanceFromNext: 20
            },
            {
                name: 'test2',
                description: '',
                position: { lat: 1.5, lon: 0.1, elevation: 0 },
                pointIdx: 30,
                distanceFromNext: 200
            },
            {
                name: 'test3',
                description: '',
                position: { lat: 2, lon: 0.5, elevation: 0 },
                pointIdx: 50,
                distanceFromNext: 1
            },
            {
                name: 'test3',
                description: '',
                position: { lat: 2.1, lon: 0.5, elevation: 0 },
                pointIdx: 55,
                distanceFromNext: null
            }
        ]
        const result = groupSectionEndpoints(1000)(stamps)
        expect(result).toStrictEqual([
            {
                name: 'test1',
                stamps: stamps.slice(0, 3)
            },
            {
                name: 'test2',
                stamps: stamps.slice(3, 4)
            },
            {
                name: 'test3',
                stamps: stamps.slice(4)
            }
        ])
    })

    it('group endpoints by distance', () => {
        const stamps = [
            {
                name: 'test1',
                description: '',
                position: { lat: 1, lon: 0, elevation: 0 },
                pointIdx: 1,
                distanceFromNext: 10
            },
            {
                name: 'test1',
                description: '',
                position: { lat: 1, lon: 0.1, elevation: 0 },
                pointIdx: 3,
                distanceFromNext: 0
            }
        ]
        const result = groupSectionEndpoints(5)(stamps)
        expect(result).toStrictEqual([
            {
                name: 'test1',
                stamps: stamps.slice(0, 1)
            },
            {
                name: 'test1',
                stamps: stamps.slice(1)
            }
        ])
    })
})

describe('Order and measure stamps', () => {
    it('works correctly', () => {
        const path: Path = {
            points: [
                { lat: 0, lon: 0, elevation: 0 },
                { lat: 1, lon: 0, elevation: 0 },
                { lat: 2, lon: 0, elevation: 0 },
                { lat: 3, lon: 0, elevation: 0 },
                { lat: 4, lon: 0, elevation: 0 }
            ]
        }
        const stamps = [
            {
                name: 'test1',
                description: '',
                position: { lat: 0, lon: 0, elevation: 0 }
            },
            {
                name: 'test2',
                description: '',
                position: { lat: 3.1, lon: 0, elevation: 0 }
            },
            {
                name: 'test3',
                description: '',
                position: { lat: 1.1, lon: 0, elevation: 0 }
            }
        ]
        const distanceInMeters: DistanceInMeters =
            (point1, point2) => Math.abs(point1.lat - point2.lat)
        const result = orderAndMeasureStamps(distanceInMeters)({
            path,
            rawStampData: stamps
        })
        expect(result).toStrictEqual({
            path,
            stamps: [
                { ...stamps[0] as Loading.RawStampData, pointIdx: 0, distanceFromNext: 1 },
                { ...stamps[2] as Loading.RawStampData, pointIdx: 1, distanceFromNext: 2 },
                { ...stamps[1] as Loading.RawStampData, pointIdx: 3, distanceFromNext: null }
            ]
        })
    })
})
