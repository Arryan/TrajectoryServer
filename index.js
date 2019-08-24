const { getData, setData } = require('./sockets')

const fetch     = require('node-fetch')
const API_KEY   = 30021130
const endpoints = {
  TRAIN: 'http://api.openmetrolinx.com/OpenDataAPI/api/V1/ServiceataGlance/Trains/All'
}

async function updateData() {
  const response = await fetch(`${endpoints['TRAIN']}?key=${API_KEY}`)
  const data = {
    train: await response.json()
  }
  setData(data)
  setTimeout(updateData, 5000)
}

updateData()