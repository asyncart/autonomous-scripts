const axios = require('axios');
var fs = require('fs')

// Re-maps a number from one range to another.
function mapValue(value, start1, stop1, start2, stop2) {
	// 75, 50, 100
	var d1 = (stop1 - start1);
	var ratio = (value - start1) / d1

	var d2 = (stop2 - start2);

	return ratio * d2 + start2
}

function hourlyRange(data, totalDiff, index0, index1) {
	var val1 = data[index0];
	var val2 = data[index1];

	var valDiff = val2 - val1;

	var percentChange = mapValue(valDiff, 0, totalDiff, 0, 1);

	if (totalDiff == 0) {
		percentChange = 0;
	}

	return [val1, val2, valDiff, percentChange];
}

/*
 * Must return an array of integer BTC prices in ascending order, ie
 * [5332,5382,5400,5432,5501,5604,5605,5762,5960,5856,5890,6189,6269,5956,5964,6248,6277,6313,6277,6248,6204,6176,5954,6169,6219]
 */
async function getHistoricalHourlyBTCPrices() {
	var url = "https://min-api.cryptocompare.com/data/v2/histohour?fsym=BTC&tsym=USD&limit=25"
	
	url += "&api_key" + process.env.CRYPTOCOMPARE_API_KEY

	var btcData = null;
	try {
    	var response = await axios.get(url);

    	var data = response.data;

    	btcData = data.Data.Data; 	
  	} catch (error) {
    	console.error(error);

    	// TODO fallback method for getting BTC price here
  	}

	var btcPricesPerHourAscending = [];

	for (var i = 0; i < btcData.length; i++) {
		btcPricesPerHourAscending.push(Math.round(btcData[i].close))
	}

	// bullrun
	// btcPricesPerHourAscending = [5332,5382,5400,5432,5501,5604,5605,5762,5960,5856,5890,6189,6269,5956,5964,6248,6277,6313,6277,6248,6204,6176,5954,6169,6219]
	// crash
	// btcPricesPerHourAscending = [7676,7599,7473,7423,7373,6758,6152,6009,5910,6050,6050,6111,6173,6030,6020,5850,5734,5792,5273,4752,4370,4611,5255,5099,5065]
	// btcPricesPerHourAscending = [7445,7454,7478,7483,7478,7549,7597,7612,7645,7675,8028,8370,8509,8531,8607,8590,8600,8634,8618,8980,9701,9913,9589,9607,9654]
	// btcPricesPerHourAscending = [5204,5228,5252,5252,5240,5252,5201,5369,5314,5307,5307,5301,5307,5295,5301,5246,5265,5438,5375,5283,5252,5301,5301,5259,5204]
	// btcPricesPerHourAscending = [8741,8742,8744,8743,8741,8739,8744,8741,8741,8743,8744,8745,8747,8740,8738,8741,8743,8741,8743,8741,8743,8747, 8800, 8790, 8812, 8814, 8807, 8809]	
	
	return btcPricesPerHourAscending;
}

async function update() {
	var btcPricesPerHourAscending = await getHistoricalHourlyBTCPrices();

	console.log("BTC Prices = " + btcPricesPerHourAscending)

	var gain = (btcPricesPerHourAscending[0] < btcPricesPerHourAscending[btcPricesPerHourAscending.length - 1])
	var min = Math.min(...btcPricesPerHourAscending);
	var max = Math.max(...btcPricesPerHourAscending);
	var diff = max-min;

	var percentChange = diff/max;


	console.log("Percent change = " + percentChange + " %")
	console.log("Gain = " + gain)
	console.log("Min = " + min);
	console.log("Max = " + max)
	console.log("Diff = " + diff)

	var scaleLow = 180; //1 - 6
	var scaleHigh = 1080; //MKANE - should this be 1080? (180 x 6) - previously 500
	var scaleSensitivity = 100;

	var rotLow = 0;
	var rotHigh = 359;

	var numLayers = 24;

	var positionXSensitivity = 1024; // half width           2048x1152
	var positionYSensitivity = 576; // half height

	var layerCache = [];

	var curLeverId = 0;
	var leverIds = [];
	var newLeverValues = [];
	
	var rotationSensitivity = 1;
	var priceDataMult = percentChange*10;

	for (var i = 0; i < numLayers; i++) {
		var priceRange = hourlyRange(btcPricesPerHourAscending, diff, i, i+1);
		
		// initial zoom is based on time frame's percentChange in price	
		if (gain) {
			scale = mapValue(percentChange, 0, 1, scaleLow, scaleHigh);
		} else {
			scale = mapValue(percentChange, 0, 1, scaleLow, scaleLow / 2);
		}

		scale += priceRange[3] * scaleSensitivity;
		scale = Math.round(scale)

		// Rotation
		//var angle = mapValue(priceRange[2], -diff, diff, -359, 359)
		//begin MKANE
		var angle = mapValue(priceRange[2], -diff, diff, -359, 359) * (priceDataMult * rotationSensitivity);
		angle = angle % 360; //MKANE - would modulo work effectively here to allow for multiplication in original algorithm-- but then normalize what the angle actually would be 
		//end MKANE
		
		angle = Math.round(angle)
		if (diff == 0) {
			angle = 0;
		}
		// keep angle within 0 - 359
		if (angle < 0) {
			angle += 360;
		}



		// Position X
		//MKANE - percentChange should be priceDataMult ? the difference is a power of 10-- so maybe or should it be x 100?
		var x = priceDataMult * positionXSensitivity * priceRange[3];
		x = Math.round(x);

		// Position Y
		var y = priceDataMult * positionYSensitivity * priceRange[3];
		y = Math.round(y);

		var layer = [scale, angle, x, y]

		leverIds.push(curLeverId++);
		leverIds.push(curLeverId++);
		leverIds.push(curLeverId++);
		leverIds.push(curLeverId++);

		newLeverValues.push(scale);
		newLeverValues.push(angle);
		newLeverValues.push(x);
		newLeverValues.push(y);

		// layerCache.push(0);layerCache.push(0);layerCache.push(scale)
		// layerCache.push(0);layerCache.push(0);layerCache.push(angle)
		// layerCache.push(0);layerCache.push(0);layerCache.push(x)
		// layerCache.push(0);layerCache.push(0);layerCache.push(y)
	}

	var achievementUnlocked = false;

	if (gain) {
		// Determine if any achievements were unlocked TODO
			
		// if no achievements
		if (achievementUnlocked == false) {
			// Determine if any markers were passed TODO
		}
	}

	// Fill in achievement ID TODO

	// Fill in markers
	layerCache.push(0);layerCache.push(0);layerCache.push(14)
	layerCache.push(0);layerCache.push(0);layerCache.push(13)
	layerCache.push(0);layerCache.push(0);layerCache.push(13)
	layerCache.push(0);layerCache.push(0);layerCache.push(13)
	layerCache.push(0);layerCache.push(0);layerCache.push(13)
	layerCache.push(0);layerCache.push(0);layerCache.push(13)

	// console.log(JSON.stringify(layerCache))
	console.log(leverIds);
	console.log(newLeverValues)

	return {
		leverIds : leverIds,
		leverValues : newLeverValues
	}
}

exports.update = update