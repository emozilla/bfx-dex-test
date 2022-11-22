const Link = require('grenache-nodejs-link')
const { PeerRPCClient, PeerSub }  = require('grenache-nodejs-ws')
const OrderBook = require('./orderbook');

const prompt = require('prompt');

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new PeerRPCClient(link, {})
peer.init()

const psub = new PeerSub(link, {})
psub.init()
psub.sub('orderbook_updates', { timeout: 10000 })

const orderbook = new OrderBook();

psub.on('message', (data) => {
  const update = JSON.parse(data);
  orderbook.update(update);
})

function updateOrderBook(order) {

  peer.request('orderbook_changes', JSON.stringify({type: 'new_order', order}), { timeout: 10000 }, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(-1)
    }
  })
}

if (process.argv[2] && process.argv[2].split("/").length === 3) {
  const order = process.argv[2].split("/");
  orderbook.createOrder({
    type:(order[0].toUpperCase() === "B")?"B":"S", 
    amount: parseInt(order[1]), 
    price: parseInt(order[2]),
    id: Date.now()
  }, updateOrderBook);
}
else {
  peer.request('orderbook_changes', JSON.stringify({type: 'get_book'}), { timeout: 10000 }, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(-1)
    }
    if (data) {
      const update = JSON.parse(data);
      orderbook.update(update);
    }
  })

}

