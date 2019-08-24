const { setData } = require('./sockets')

const fetch           = require('node-fetch')
const API_KEY         = 30021130
const UPDATE_INTERVAL = 10000
const endpoints = {
  TRAIN: 'http://api.openmetrolinx.com/OpenDataAPI/api/V1/ServiceataGlance/Trains/All'
}

async function updateData() {
  const response = await fetch(`${endpoints['TRAIN']}?key=${API_KEY}`)
  const data = {
    train: processGOData(await response.json())
  }
  setData(data)
  setTimeout(updateData, 5000)
}

function processGOData(json) {
  // TODO: Add all lines and all directions
  let trains = json.Trips.Trip.filter(trip => trip.LineCode == "LE" && trip.VariantDir == "W")
  
  return trains.map((train) => (
    {
      id: train.TripNumber,
      isMoving: train.IsInMotion,
      position: [train.Latitude, train.Longitude],
      cars: parseInt(train.Cars),
      nextStation: train.NextStopCode
    })
  )
}

updateData()