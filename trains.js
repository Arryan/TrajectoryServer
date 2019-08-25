const fetch = require('node-fetch')
const ENDPOINT = 'http://api.openmetrolinx.com/OpenDataAPI/'
const API_KEY = '30021130'
const stations = require('./stations').stations
const geometry = require('./tracks.json')

const turf = require('@turf/turf')

exports.getData = async function() {
    let trains = await getTrainPositions()
    trains = trains.filter(train => train.LineCode == "LE" && train.VariantDir == "E")

    return (await Promise.all(trains.map(async (train) => {
        let next = await getStationArrival(train.NextStopCode, train.TripNumber)
        if (next == null) return
        let time = Date.parse(next.ComputedDepartureTime)

        return {
            id: train.TripNumber,
            location: [train.Latitude, train.Longitude],
            nextStation: train.NextStopCode,
            arrivalTime: time,
            distance: getDistanceToStation(train.NextStopCode, [train.Latitude, train.Longitude])
        }
    })))
    .filter(train => train != null)
}

/**
 * Looks up the arrival of a train at a station
 * @param {string} station The StopCode of the station to lookup
 * @param {string} train The id of the train
 * @returns The trip of the train, or null if there are no trips for that train at the station
 */
async function getStationArrival(station, train) {
    let response = await fetch(`${ENDPOINT}/api/V1/Stop/NextService/${station}?key=${API_KEY}`)
    let data = await response.json()

    if (data.NextService == null) return null

    for (let trip of data.NextService.Lines) {
        if (trip.TripNumber === train) {
            return trip
        }
    }

    return null
}

async function getTrainPositions(){
    let response = await fetch(`${ENDPOINT}/api/V1/ServiceataGlance/Trains/All/?key=${API_KEY}`)
    return (await response.json()).Trips.Trip
}

function getDistanceToStation(stationCode, trainLocation) {
    let line = turf.lineString(geometry.features[0].geometry.coordinates)
    let station = stations[stationCode]

    let sliced = turf.lineSlice(turf.point([station[1], station[0]]), turf.point([trainLocation[1], trainLocation[0]]), line)
    return turf.length(sliced, {units: 'kilometers'})
}