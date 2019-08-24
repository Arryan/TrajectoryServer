const { setData } = require('./sockets')
const goTrains = require('./trains')

const fetch           = require('node-fetch')
const API_KEY         = 30021130
const UPDATE_INTERVAL = 10000
const endpoints = {
  // TODO: Add other Streetcar lines...
  STREETCAR: 'http://webservices.nextbus.com/service/publicJSONFeed?command=vehicleLocations&a=ttc&r=506&t=0'
}

async function updateData() {
  const streetResponse = await fetch(`${endpoints['STREETCAR']}`)
  const data = {
    train: await goTrains.getData(),
    streetcar: processStreetcarData(await streetResponse.json())
  }
  setData(data)
  setTimeout(updateData, UPDATE_INTERVAL)
}


function processStreetcarData(json) {
  return json.vehicle.map((streetcar) => ({
    id: streetcar.id,
    position: [streetcar.lat, streetcar.lon]
  }))
}

updateData()