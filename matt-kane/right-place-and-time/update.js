const axios = require('axios');
var fs = require('fs')

const LEVER_ID_ACHIEVEMENT 	= 96;
const LEVER_ID_NUM_0 		= 97;
const LEVER_ID_NUM_1 		= 98;
const LEVER_ID_NUM_2 		= 99;
const LEVER_ID_NUM_3 		= 100;
const LEVER_ID_NUM_4 		= 101;

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
	
	//crash data
	return [7676,7599,7473,7423,7373,6758,6152,6009,5910,6050,6050,6111,6173,6030,6020,5850,5734,5792,5273,4752,4370,4611,5255,5099,5065];
	
	
	//crash data over 9k
	//crash data
	//return [7676,7599,7473,7423,7373,6758,6152,6009,5910,6050,6050,6111,6173,6030,6020,5850,5734,5792,5273,4752,4370,4611,5255,5099,9265];
	
	
	//return [5204,5204,5204,5204,5204,5204,5204,5204,5204,5204,5204,5204,5204,5204,5204,5204,5204,5206,5204,5204,5204,5204,5204,5204,5205];
	
	//no change
	//return  [5204,5204,5204,5204,5204,5204,5204,5204,5204,5204,5204,5204,5204,5204,5204,5204,5204,5204,5204,5204,5204,5204,5204,5204,5204];
	
	/*var url = "https://min-api.cryptocompare.com/data/v2/histohour?fsym=BTC&tsym=USD&limit=25"
	
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
	
	return btcPricesPerHourAscending;*/
}


// Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

function checkNumberAchievement(value0, value1, number, multiple){
	
	if(value0 < (number*multiple) && value1 >= (number*multiple)){
		return true;
	}
	
	return false;
	
}

function getNumberCode(num){
	if(num=="$"){
		return 0;
	}
	if(num=="0"){
		return 1;
	}
	if(num=="1"){
		return 2;
	}
	if(num=="2"){
		return 3;
	}
	if(num=="3"){
		return 4;
	}
	if(num=="4"){
		return 5;
	}
	if(num=="5"){
		return 6;
	}
	if(num=="6"){
		return 7;
	}
	if(num=="7"){
		return 8;
	}
	if(num=="8"){
		return 9;
	}
	if(num=="9"){
		return 10;
	}
	if(num=="K"){
		return 11;
	}
	if(num=="M"){
		return 12;
	}
	
	return 13;
}



function setNumberAchievement(leverIds, newLeverValues, str){
	
	var number_max = 12;
	
	const chars = str.split('');
	
	for(var i=0;i<chars.length;i++){
		var code = getNumberCode(chars[i]);
		leverIds.push(curLeverId++);
		leverIds.push(curLeverId++);
		leverIds.push(curLeverId++);
		newLeverValues.push(0);
		newLeverValues.push(number_max);
		newLeverValues.push(code);
	}
	
	//do i need to return leverIds and newLayerValues as arrays and set them outside the function again?
	
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

	

    var achievement_drop = 0;
	
	var ath_target = 19783;

	var achievement_gain = [9000,11000,33000,50000,90000,100000,250000,500000,750000,900000,1000000,9000000, ath_target];
	var achievement_code = [1,2,3,4,5,6,7,8,9,10,11,12, 13];
	
	var achievement_dead = 14; //subjective
	var achievement_halvening = 15; //subjective
	var achievement_flippening = 16; //subjective
	
	var achievement_hidden = 17; //default
	var achievement_max = 17;
	//
	//
	
	

	var scaleLow = 100; 
	var scaleHigh = 600; 
	var scaleSensitivity = 100;

	var rotLow = 0;
	var rotHigh = 359;

	var numLayers = 24;

	var positionXSensitivity = 1024; // half width   2048x1152
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

		
		var angle = mapValue(priceRange[2],-diff,diff, 360,-360) * (priceDataMult*rotationSensitivity);
		angle = angle % 360;
		angle = Math.round(angle);



		// Position X
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

		 //layerCache.push(0);layerCache.push(0);layerCache.push(scale)
		 //layerCache.push(0);layerCache.push(0);layerCache.push(angle)
		 //layerCache.push(0);layerCache.push(0);layerCache.push(x)
		 //layerCache.push(0);layerCache.push(0);layerCache.push(y)
	}

	var achievementUnlocked = false;

	if (gain) {
		// Determine if any achievements were unlocked TODO
		var lastVal = btcPricesPerHourAscending.length - 1;
		
		console.log("CHECKING");
		console.log(btcPricesPerHourAscending[0]);
		console.log(btcPricesPerHourAscending[lastVal]);
		
		for(var i=0;i<achievement_gain.length;i++){
			
			if(btcPricesPerHourAscending[0] < achievement_gain[i] && btcPricesPerHourAscending[lastVal] >= achievement_gain[i]){
				achievementUnlocked = true;
				
				leverIds.push(LEVER_ID_ACHIEVEMENT);
				newLeverValues.push(achievement_code[i]);
			}
			
		}
	} else {		
		console.log("Checking for drop achievement.")
		// if the percent change was greater or equal to 20%
		if(percentChange >= .2){
			console.log("Drop achieved!");

			achievementUnlocked = true;

			leverIds.push(LEVER_ID_ACHIEVEMENT);
			newLeverValues.push(achievement_drop);
		}		
	}
		
	// if no achievements
	if (gain == true && achievementUnlocked == false) {
		
		// set achievement as hidden
		leverIds.push(LEVER_ID_ACHIEVEMENT);
		newLeverValues.push(achievement_hidden);
		
	
		
		//check if any number markers have been set
		var achievement_vals = null;
		var letter = "";
		var multiple = 1;
		
		if(btcPricesPerHourAscending[lastVal]>=1 && btcPricesPerHourAscending[lastVal]<1000){
			achievement_vals = [1,13,31,266,504,630,750];
			multiple = 1;
			letter = "";
		}
		else if(btcPricesPerHourAscending[lastVal]>=1000 && btcPricesPerHourAscending[lastVal]<1000000){
			
			achievement_vals = [1,2,3,4,5,6,7,8,10,20,25,30,40,60,69,75,88,99,125,150,175,200,222,275,300,333,350,400,444,666,888];
			multiple = 1000;
			letter = "K";
			
		}
		
		//check values 
		if(achievement_vals){
			for(var i=0;i<achievement_vals.length;i++){

				if(checkNumberAchievement(btcPricesPerHourAscending[0], btcPricesPerHourAscending[lastVal], achievement_vals[i], multiple) == true){
					
					var str = "$" + achievement_vals[i] + letter;
					setNumberAchievement(leverIds, newLeverValues, str);
					achievementUnlocked = true;
					
				}
				
			}
		}
		
		if(btcPricesPerHourAscending[lastVal]>=1000000 && btcPricesPerHourAscending[lastVal] < 1000000000 ){
			
			var num0 =  Math.round(btcPricesPerHourAscending[0]/1000000);
			var num1 =  Math.round(btcPricesPerHourAscending[lastVal]/1000000);
			
			if(num0!=num1 && num1>num0){
				var str = "$" + num1 + "M";
				setNumberAchievement(leverIds, newLeverValues, str);
				achievementUnlocked = true;
			}
				
		}
		
		if(achievementUnlocked==false){
			//do i need to add anything here to render nothing in numbers?
		}
		
	}	
		

	//console.log(mapValue(2,0,10,0,1));

	// Fill in achievement ID TODO

	// Fill in markers
	/*layerCache.push(0);layerCache.push(0);layerCache.push(14)
	layerCache.push(0);layerCache.push(0);layerCache.push(13)
	layerCache.push(0);layerCache.push(0);layerCache.push(13)
	layerCache.push(0);layerCache.push(0);layerCache.push(13)
	layerCache.push(0);layerCache.push(0);layerCache.push(13)
	layerCache.push(0);layerCache.push(0);layerCache.push(13)*/

	// console.log(JSON.stringify(layerCache))
	console.log(leverIds);
	console.log(newLeverValues)

	fs.writeFileSync("values.json", JSON.stringify(newLeverValues));

	return {
		leverIds : leverIds,
		leverValues : newLeverValues
	}
}



update();
//exports.update = update