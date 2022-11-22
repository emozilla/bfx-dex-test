const Link = require('grenache-nodejs-link')
const { PeerRPCServer, PeerPub }  = require('grenache-nodejs-ws')
const OrderBook = require('./orderbook');

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const server = new PeerRPCServer(link, {})
server.init()

const pub = new PeerPub(link, {})
pub.init()

const service = server.transport('server')
const servicepub = pub.transport('server')

service.listen(1024 + Math.floor(Math.random() * 1000))
servicepub.listen(1024 + Math.floor(Math.random() * 1000))

const orderbook = new OrderBook();

setInterval(function () {
  link.announce('orderbook_changes', service.port, {})
  link.announce('orderbook_updates', servicepub.port, {})
}, 1000)

service.on('request', async (rid, key, payload, handler) => {
  const data = JSON.parse(payload);
  switch(data.type) {
    case 'new_order':
      orderbook.createOrder(data.order)
      servicepub.pub(JSON.stringify({ buy: orderbook.buy, sell: orderbook.sell}))
      handler.reply(null, 'ok')
    break;
    case 'get_book':
     handler.reply(null, JSON.stringify({ buy: orderbook.buy, sell: orderbook.sell})) 
    break;
  }
})