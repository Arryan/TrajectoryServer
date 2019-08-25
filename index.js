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
  try {
  const streetResponse = await fetch(`${endpoints['STREETCAR']}`)
  const train = await goTrains.getData()
  const streetcar = processStreetcarData(await streetResponse.json())
  setData(train, {}, streetcar)
  } catch (err) {
    console.log('THERE WAS ERROR', err)
  }
  setTimeout(updateData, UPDATE_INTERVAL)
}


function processStreetcarData(json) {
  const { streetcar } = getData()
  return json.vehicle.map((sc) => {
    const prev = streetcar.find(x => x.id === sc.id)
    const lon = Number(sc.lon)
    const lat = Number(sc.lat)
    return {
      id: sc.id,
      location: [lat, lon],
      speed: !prev || prev.location === undefined ? 0 : Math.sqrt(
        (prev.location[0] - lat)**2 + 
        (prev.location[1] - lon)**2 ),
      angle: sc.heading,
      ts: Date.now() - (sc.secsSinceReport * 1000),
    }
  })
}

updateData()