const ATTRIBUTES  = ['Latitude', 'Longitude', ]
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
exports.setData = (d) => {
  console.log('data was updated')
  data = d
  for (let client of wss.clients) {
    client.send(JSON.stringify(data))
  }
}
console.log('sockets were setup')
