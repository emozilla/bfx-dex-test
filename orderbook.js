class OrderBook {
	
	constructor(data) {
		this.buy = [];
		this.sell = [];
		if (data) {
			update(data);	
		}
	}

	createOrder(order, callback) {
		
		const opA = (order.type === 'B')? this.sell : this.buy;
		const opB = (order.type === 'B')? this.buy : this.sell; 
	
		if (opA.length > 0) {
			let amount = order.amount;
			for (let i = 0; i < opA.length && amount > 0; i++) {
				if (opA[i].price === order.price && opA[i].amount > 0) {

					let available = opA[i].amount;
					opA[i].amount = available - amount;

					// Perform the exchange here...
					console.log(`Order id: ${opA[i].id} executed`);

					if (opA[i].amount <= 0) {
						console.log(`Order id: ${opA[i].id} fulfilled`);						
					}

					amount -= available;
				}
			}

			if (amount > 0) {
				order.amount = amount;
				opB.push(order);
			}

		}
		else {
			opB.push(order);
		}

		callback && callback(order);
	}

	update(data, callback) {
		if (data.buy)
			this.buy=data.buy.filter(o => o.amount > 0);
		if (data.sell)
			this.sell=data.sell.filter(o => o.amount > 0);

		if (callback) {
			callback();
		}
		else {
			console.log("BUY:");
			console.table(this.buy);
			console.log("SELL:");
			console.table(this.sell);
		}
	}
}

module.exports = OrderBook