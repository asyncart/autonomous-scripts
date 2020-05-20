const axios = require('axios');
var fs = require('fs')

/*
 * Must return an array of integer ETH prices in ascending order, ie
 * [213,212,212,212,213,215,214,214,213,213,213,213,213,213,214,214,213,213,214,214,214,208,209,209,210,210]
 */
async function getHistoricalHourlyETHPrices() {
	return [213,212,212,212,213,215,214,214,213,213,213,213,213,213,214,214,213,213,214,214,214,208,209,209,210,210];
	var url = "https://min-api.cryptocompare.com/data/v2/histohour?fsym=ETH&tsym=USD&limit=25"
	
	url += "&api_key" + process.env.CRYPTOCOMPARE_API_ETH_KEY

	var ethData = null;
	try {
    	var response = await axios.get(url);

    	var data = response.data;

    	ethData = data.Data.Data; 	
  	} catch (error) {
    	console.error(error);

    	// TODO fallback method for getting ETH price here
  	}

	var ethPricesPerHourAscending = [];

	for (var i = 0; i < ethData.length; i++) {
		ethPricesPerHourAscending.push(Math.round(ethData[i].close))
	}
	
	return ethPricesPerHourAscending;
}

async function update() {
	var ethPricesPerHourAscending = await getHistoricalHourlyETHPrices();

	console.log("ETH Prices = " + ethPricesPerHourAscending)

	var leverIds = [0];
	var newLeverValues = [];

	var firstPrice = ethPricesPerHourAscending[0];
	var currentPrice = ethPricesPerHourAscending[ethPricesPerHourAscending.length - 1];

	console.log("First ETH Price = " + firstPrice);
	console.log("Current ETH Price = " + currentPrice);

	if (currentPrice >= firstPrice) {
		newLeverValues.push(0);
	} else {
		newLeverValues.push(1);
	}

	console.log(leverIds);
	console.log(newLeverValues)

	return {
		leverIds : leverIds,
		leverValues : newLeverValues
	}
}

exports.update = update