// const ATTRIBUTES  = ['Latitude', 'Longitude', ]
const WebSocket   = require('ws')
const port        = process.env.PORT || 8080
const wss         = new WebSocket.Server({ port })
let data          = {
  train:      {},
  bus:        {},
  streetcar:  {},
  subway:     {},
}

wss.on('connection', function connection(ws) {
  ws.send(JSON.stringify(data))
})

exports.getData = ( ) => data
exports.setData = (train = {}, bus = {}, streetcar = {}, subway = {}) => {
  data = { train, bus, streetcar, subway }

  for (let client of wss.clients) {
    client.send(JSON.stringify(data))
  }
}
