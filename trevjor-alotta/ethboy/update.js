const axios = require('axios');
var fs = require('fs')

// ==========================================================================================
// Scrolling Background
// ==========================================================================================

const MAX_SCROLLING_BACKGROUND_Y		= 10420;
const MIN_SCROLLING_BACKGROUND_Y		= -10420;
const SCROLL_BACKGROUND_STEP			= 208;
const ETH_PERCENT_CHANGE_FOR_BIG_STEP	= 0.1; // -+10% jumps
const ETH_BIG_STEP_COUNT				= 5; // the number of steps for a big step

// ==========================================================================================
// Vitalik Face
// ==========================================================================================

const VITALIK_FACE_VERY_HAPPY			= 0;
const VITALIK_FACE_HAPPY 				= 1;
const VITALIK_FACE_SLIGHTLY_HAPPY		= 2;
const VITALIK_FACE_SLIGHTLY_SAD			= 3;
const VITALIK_FACE_SAD 					= 4;
const VITALIK_FACE_VERY_SAD				= 5;
const VITALIK_FACE_NEUTRAL				= 6;

// ==========================================================================================
// Vitalik Birthday
// ==========================================================================================

const VITALIK_OBJECT_BABY				= 0;
const VITALIK_OBJECT_CAKE				= 1;
const VITALIK_OBJECT_NONE				= 2;

// ==========================================================================================
// Butterfly
// ==========================================================================================

const MIN_BUTTERFLY_X 					= -718;
const MAX_BUTTERFLY_X 					= 718;

const MIN_BUTTERFLY_Y					= -1080;
const MAX_BUTTERFLY_Y					= 1080;

const BUTTERFLY_STEP					= 22;
const BTC_PERCENT_FOR_BIG_STEP			= 0.1; // -+10% jumps
const BTC_BIG_STEP_COUNT				= 5;

const TOTAL_BUTTERFLY_STATES			= 4;

const VITALIK_FACE_RULES = [
	[999999099,	0.3, 	VITALIK_FACE_VERY_HAPPY],
	[0.3, 		0.2, 	VITALIK_FACE_HAPPY],
	[0.2, 		0.1, 	VITALIK_FACE_SLIGHTLY_HAPPY],
	[-0.1, 		-0.2, 	VITALIK_FACE_SLIGHTLY_SAD],
	[-0.2, 		-0.3, 	VITALIK_FACE_SAD],
	[-0.3, 		-9999, 	VITALIK_FACE_VERY_SAD]
]

const LEVER_ID_SCROLLING_BACKGROUND = 0;
const LEVER_ID_CLOTHES_GREEN 		= 1;
const LEVER_ID_CLOTHES_RED 			= 2;
const LEVER_ID_VITALIK_FACE 		= 3; // +3, +2, +1, -1, -2, -3, 0
const LEVER_ID_VITALIK_OBJECT		= 4;
const LEVER_ID_FIRE					= 5;
const LEVER_ID_BUTTERFLY_STATE		= 6;
const LEVER_ID_BUTTERFLY_X			= 7;
const LEVER_ID_BUTTERFLY_Y			= 8;

const BASE_GAS_PRICE				= 100;

// staging
const CONTROL_TOKEN_ADDRESS			= "0x4f37310372dd39d451f7022ee587fa8b9f72d80b";
const CONTROL_TOKEN_ID				= 2022;

async function update(util) {	
	var ethPricesPerHourAscending = await util.getHistoricalHourlyPrices("ETH");

	console.log(ethPricesPerHourAscending)

	var firstEthPrice = ethPricesPerHourAscending[0];
	var currentEthPrice = ethPricesPerHourAscending[ethPricesPerHourAscending.length - 1];

	var btcPricesPerHourAscending = await util.getHistoricalHourlyPrices("BTC");

	var firstBtcPrice = btcPricesPerHourAscending[0];
	var currentBtcPrice = btcPricesPerHourAscending[btcPricesPerHourAscending.length - 1];

	console.log(btcPricesPerHourAscending)

	var leverIds = [];
	var newLeverValues = [];

	// Scrolling background	
	var currentBackgroundScrollY = await util.getTokenValue(CONTROL_TOKEN_ADDRESS, CONTROL_TOKEN_ID, LEVER_ID_SCROLLING_BACKGROUND);
	var backgroundScrollMovement = 0;

	var ethPercentChange = (currentEthPrice / firstEthPrice) - 1.0;

	console.log("ETH % change in 24 hours = " + ethPercentChange)

	if (ethPercentChange > ETH_PERCENT_CHANGE_FOR_BIG_STEP) {
		backgroundScrollMovement = ETH_BIG_STEP_COUNT * SCROLL_BACKGROUND_STEP;
	} else if (ethPercentChange < -ETH_PERCENT_CHANGE_FOR_BIG_STEP) {
		backgroundScrollMovement = -ETH_BIG_STEP_COUNT * SCROLL_BACKGROUND_STEP;
	} else if (ethPercentChange > 0) {
		backgroundScrollMovement = SCROLL_BACKGROUND_STEP;
	} else if (ethPercentChange < 0) {
		backgroundScrollMovement = -SCROLL_BACKGROUND_STEP;
	}

	var newCurrentBackgroundScrollY = currentBackgroundScrollY + backgroundScrollMovement;

	newCurrentBackgroundScrollY = Math.round(newCurrentBackgroundScrollY);
	newCurrentBackgroundScrollY = Math.min(newCurrentBackgroundScrollY, MAX_SCROLLING_BACKGROUND_Y);
	newCurrentBackgroundScrollY = Math.max(newCurrentBackgroundScrollY, MIN_SCROLLING_BACKGROUND_Y);	

	leverIds.push(LEVER_ID_SCROLLING_BACKGROUND)
	newLeverValues.push(newCurrentBackgroundScrollY);

	// Gas Prices (Green / Red)
	var currentEthGasPrices = await util.getEthGasPrices();
	if (currentEthGasPrices > BASE_GAS_PRICE) {
		// fade in red
		leverIds.push(LEVER_ID_CLOTHES_GREEN)
		newLeverValues.push(0);

		leverIds.push(LEVER_ID_CLOTHES_RED)

		var redOpacity = currentEthGasPrices - BASE_GAS_PRICE;
		redOpacity = Math.min(redOpacity, 100);
		newLeverValues.push(redOpacity);
	} else if (currentEthGasPrices < BASE_GAS_PRICE) {
		// fade in green
		leverIds.push(LEVER_ID_CLOTHES_RED)
		newLeverValues.push(0);

		leverIds.push(LEVER_ID_CLOTHES_GREEN)

		var greenOpacity = BASE_GAS_PRICE - currentEthGasPrices;
		greenOpacity = Math.min(greenOpacity, 100);
		newLeverValues.push(greenOpacity);
	} else {
		leverIds.push(LEVER_ID_CLOTHES_GREEN)
		newLeverValues.push(0);
		leverIds.push(LEVER_ID_CLOTHES_RED)
		newLeverValues.push(0);		
	}
	

	// Face expression
	var newFacialExpression = VITALIK_FACE_NEUTRAL; // start neutral by default

	for (var i = 0; i < VITALIK_FACE_RULES.length; i++) {
		var ruleMax = VITALIK_FACE_RULES[i][0];
		var ruleMin = VITALIK_FACE_RULES[i][1];

		if ((ethPercentChange <= ruleMax) && (ethPercentChange >= ruleMin)) {
			newFacialExpression = VITALIK_FACE_RULES[2];
			break;
		}
	}
	leverIds.push(LEVER_ID_VITALIK_FACE)
	newLeverValues.push(newFacialExpression);

	// Object in hands
	var now = new Date(Date.now());
	var utcDate = now.getUTCDate();
	var utcMonth = now.getUTCMonth();
	
	leverIds.push(LEVER_ID_VITALIK_OBJECT)

	if ((utcMonth === 0) && (utcDate === 31)) { // January 31st Vitalik Birthday 1/31
		newLeverValues.push(VITALIK_OBJECT_CAKE);
	} else if ((utcMonth === 6) && (utcDate === 30)) { // July 30th Ethereum Launch 7/30
		newLeverValues.push(VITALIK_OBJECT_BABY);
	} else {
		newLeverValues.push(VITALIK_OBJECT_NONE);
	}

	// Fire opacity TODO if scrolling background is getting close to the bottom then start to fade in fire
	leverIds.push(LEVER_ID_FIRE)
	newLeverValues.push(0);

	// butterfly state
	var butterFlyState = util.getRandomInt(TOTAL_BUTTERFLY_STATES);
	leverIds.push(LEVER_ID_BUTTERFLY_STATE)
	newLeverValues.push(butterFlyState);

	// butterfly X
	var butterflyRange = MAX_BUTTERFLY_X - MIN_BUTTERFLY_X;
	var newButterflyX = util.getRandomInt(butterflyRange) + MIN_BUTTERFLY_X;
	newButterflyX = Math.min(newButterflyX, MAX_BUTTERFLY_X);
	newButterflyX = Math.max(newButterflyX, MIN_BUTTERFLY_X);

	leverIds.push(LEVER_ID_BUTTERFLY_X)
	newLeverValues.push(newButterflyX);

	// butterfly Y
	var currentlyButterflyY = await util.getTokenValue(CONTROL_TOKEN_ADDRESS, CONTROL_TOKEN_ID, LEVER_ID_BUTTERFLY_Y);
	var butterflyMovement = 0;

	var btcPercentChange = (currentBtcPrice / firstBtcPrice) - 1.0;

	console.log("BTC % change in 24 hours = " + btcPercentChange)

	if (btcPercentChange > BTC_PERCENT_FOR_BIG_STEP) {
		butterflyMovement = BTC_BIG_STEP_COUNT * BUTTERFLY_STEP;
	} else if (btcPercentChange < -BTC_PERCENT_FOR_BIG_STEP) {
		butterflyMovement = -BTC_BIG_STEP_COUNT * BUTTERFLY_STEP;
	} else if (btcPercentChange > 0) {
		butterflyMovement = BUTTERFLY_STEP;
	} else if (btcPercentChange < 0) {
		butterflyMovement = -BUTTERFLY_STEP;
	}

	var newButterflyY = currentlyButterflyY + butterflyMovement;

	newButterflyY = Math.round(newButterflyY);
	newButterflyY = Math.min(newButterflyY, MAX_BUTTERFLY_Y);
	newButterflyY = Math.max(newButterflyY, MIN_BUTTERFLY_Y);	

	leverIds.push(LEVER_ID_BUTTERFLY_Y)
	newLeverValues.push(newButterflyY);

	return {
		leverIds : leverIds,
		leverValues : newLeverValues
	}
}

exports.update = update