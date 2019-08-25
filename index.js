const { setData, getData } = require('./sockets')
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
  const { streetcar } = getData()
  return json.vehicle.map((sc) => ({
    id: sc.id,
    position: [Number(sc.lat), Number(sc.lon)],
    speed: streetcar.position === undefined ? 0 : Math.sqrt(
      (streetcar.position[0] - sc.position[0])**2 + 
      (streetcar.position[1] - sc.position[1])**2 ),
    ts: Date.now() - (sc.secsSinceReport * 1000),
  }))
}

updateData()