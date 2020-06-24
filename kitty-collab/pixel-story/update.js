var ethers = require("ethers");

const EMOTE_BTC = 1;
const EMOTE_ETH = 5;
const EMOTE_HEART = 8;

const MASTER_TOKEN_ID = 663;

const KITTY_CICERONE = MASTER_TOKEN_ID + 2;
const KITTY_BLACK_CAT = MASTER_TOKEN_ID + 3;
const KITTY_METACAT = MASTER_TOKEN_ID + 4;
const KITTY_CHESHIRE = MASTER_TOKEN_ID + 5;
const KITTY_PXLCAT = MASTER_TOKEN_ID + 6;
const KITTY_QT = MASTER_TOKEN_ID + 7;
const KITTY_BREADBREAKER = MASTER_TOKEN_ID + 8;
const KITTY_CONLAN = MASTER_TOKEN_ID + 9;
const KITTY_NOSHOT = MASTER_TOKEN_ID + 10;
const KITTY_MIAOU = MASTER_TOKEN_ID + 11;
const KITTY_CK = MASTER_TOKEN_ID + 12;

const MAX_KITTY_DISTANCE_FOR_INTERACTION = 175;

var contract;

function convertRawData(dataRaw, kitty) {
	var data = [];
	
	var x = 0;
	var y = 0;
	var emote = 0;
	var visible = false;

	for (var i = 0; i < dataRaw.length; i++) {
		var value = parseInt(dataRaw[i].toString());
		data.push(value);
	}

	if (kitty === KITTY_CICERONE) {
		x = data[2];
		y = data[5];
		visible = (data[11] === 1)
		emote = data[14];		
	} else if (kitty === KITTY_BLACK_CAT) {
		x = data[2];
		y = data[5];
		visible = (data[8] === 1)
		emote = data[11];		
	} else if (kitty === KITTY_METACAT) {
		x = data[5];
		y = data[8];
		visible = (data[14] === 1)
		emote = data[17];		
	} else if (kitty === KITTY_CHESHIRE) {
		x = data[5];
		y = data[8];
		visible = (data[14] === 1)
		emote = data[17];		
	} else if (kitty === KITTY_PXLCAT) {
		x = data[5];
		y = data[8];
		visible = (data[14] === 1)
		emote = data[17];		
	} else if (kitty === KITTY_QT) {
		x = data[5];
		y = data[8];
		visible = (data[14] === 1)
		emote = data[17];		
	} else if (kitty === KITTY_BREADBREAKER) {
		x = data[2];
		y = data[5];
		visible = (data[11] === 1)
		emote = data[14];		
	} else if (kitty === KITTY_CONLAN) {
		x = data[2];
		y = data[5];
		visible = (data[11] === 1)
		emote = data[14];		
	} else if (kitty === KITTY_NOSHOT) {
		x = data[2];
		y = data[5];
		visible = (data[11] === 1)
		emote = data[14];		
	} else if (kitty === KITTY_MIAOU) {
		x = data[5];
		y = data[8];
		visible = (data[14] === 1)
		emote = data[17];		
	} else if (kitty === KITTY_CK) {
		x = data[5];
		y = data[8];
		visible = (data[17] === 1)
		emote = data[20];		
	}

	return {
		id : kitty,
		x : x,
		y : y,
		visible : visible,
		emote : emote
	}
}

async function getPositionAndEmote(kitty) {
	var dataRaw = await contract.getControlToken(kitty);

	console.log("Fetching contract data for kitty #" + kitty + "\n 	" + dataRaw);
	
	var convertedData = convertRawData(dataRaw, kitty);
	
	// only return converted kitty data if it's showing an accepted emote
	if ((convertedData.visible) //&& 
		// ((convertedData.emote == EMOTE_HEART) || (convertedData.emote == EMOTE_BTC) || (convertedData.emote == EMOTE_ETH))
		) {
		return convertedData;
	} else {
		return null;
	}
}

async function update(providerURL, contractAddress, contractABI) {	
	let provider = new ethers.providers.JsonRpcProvider(providerURL)
	contract = new ethers.Contract(contractAddress, contractABI, provider);

	/*
	* 0 = Sun State
	* 1 = Sword1 Visibility
	* 2 = Sword1 Position X
	* 3 = Sword1 Position Y
	* (repeated for all 5 swords)
	*/
	var leverIds = [];
	var newLeverValues = []; 

	// Get kitty data 
	var kitties = [];

	var kitty = await getPositionAndEmote(KITTY_CICERONE)
	if (kitty !== null) {
		kitties.push(kitty);
	}
	kitty = await getPositionAndEmote(KITTY_BLACK_CAT)
	if (kitty !== null) {
		kitties.push(kitty);
	}
	kitty = await getPositionAndEmote(KITTY_METACAT)
	if (kitty !== null) {
		kitties.push(kitty);
	}
	kitty = await getPositionAndEmote(KITTY_CHESHIRE)
	if (kitty !== null) {
		kitties.push(kitty);
	}
	kitty = await getPositionAndEmote(KITTY_PXLCAT)
	if (kitty !== null) {
		kitties.push(kitty);
	}
	kitty = await getPositionAndEmote(KITTY_QT)
	if (kitty !== null) {
		kitties.push(kitty);
	}
	kitty = await getPositionAndEmote(KITTY_BREADBREAKER)
	if (kitty !== null) {
		kitties.push(kitty);
	}
	kitty = await getPositionAndEmote(KITTY_CONLAN)
	if (kitty !== null) {
		kitties.push(kitty);
	}
	kitty = await getPositionAndEmote(KITTY_NOSHOT)
	if (kitty !== null) {
		kitties.push(kitty);
	}
	kitty = await getPositionAndEmote(KITTY_MIAOU)
	if (kitty !== null) {
		kitties.push(kitty);
	}
	kitty = await getPositionAndEmote(KITTY_CK)
	if (kitty !== null) {
		kitties.push(kitty);
	}
	
	console.log(kitties)

	// Determine pairs of kitties that are close enough to be valid (heart x heart, ETH/BTC x BTC/ETH)
	var hasValidHeartCombo = false;

	var usedKittySet = new Set();

	var swordLeverIds = [1, 4, 7, 10, 13];

	// Check pairs for ETH/BTC and place an available sword between them
	for (var i = 0; i < kitties.length; i++) {
		var kittyA = kitties[i];
		if (usedKittySet.has(kittyA.id)) {
			continue;
		}

		for (var k = 0; k < kitties.length; k++) {
			if (i == k) {
				continue;
			}

			var kittyB = kitties[k];
			if (usedKittySet.has(kittyB.id)) {
				continue;
			}

			// check if kitties are within interaction zone
			if (getDistanceForKitties(kittyA, kittyB) <= MAX_KITTY_DISTANCE_FOR_INTERACTION) {
				if (checkForValidHearts(kittyA, kittyB)) {
					usedKittySet.add(kittyA.id);
					usedKittySet.add(kittyB.id);

					console.log(kittyA.id + " is loving " + kittyB.id);

					hasValidHeartCombo = true;
					break;
				} else if (checkForValidFight(kittyA, kittyB)) {
					usedKittySet.add(kittyA.id);
					usedKittySet.add(kittyB.id);

					console.log(kittyA.id + " is fighting " + kittyB.id);

					// Turn on a sword and place it in the middle distance of these 2 kitties
					enableAndPlaceSwordsBetweenKitties(leverIds, newLeverValues, swordLeverIds, kittyA, kittyB)
					break;
				}
			}			
		}
	}

	// Check if any pairs have hearts, if so then display the heart sun, otherwise normal sun
	leverIds.push(0);
	if (hasValidHeartCombo) {
		newLeverValues.push(1);
	} else {
		newLeverValues.push(0);
	}

	// hide the remaining unused swords
	for (var i = 0; i < swordLeverIds.length; i++) {
		leverIds.push(swordLeverIds[i]);
		newLeverValues.push(0); // 0 for OFF visibility
	}

	console.log(leverIds);
	console.log(newLeverValues);

	return {
		leverIds : leverIds,
		leverValues : newLeverValues
	}
}

function enableAndPlaceSwordsBetweenKitties(leverIds, newLeverValues, swordLeverIds, kittyA, kittyB) {
	// get the first sword lever id
	var swordLeverId = swordLeverIds[0];
	// remove the lever id from the array
	swordLeverIds.splice(0, 1);

	var swordVisibilityLever = swordLeverId;
	var swordPositionXLeverId = swordLeverId + 1;
	var swordPositionYLeverId = swordLeverId + 2;

	// keep sword values within min/max token bounds
	// place sword in middle spot between the 2 kitties
	var middleX = Math.round((kittyA.x + kittyB.x) / 2);
	middleX = Math.max(middleX, -1000);
	middleX = Math.min(middleX, 1000);

	var middleY = Math.round((kittyA.y + kittyB.y) / 2);
	middleY = Math.max(middleY, -1000);
	middleY = Math.min(middleY, 1000);

	// set sword lever visibility to ON
	leverIds.push(swordLeverId);
	newLeverValues.push(1);

	leverIds.push(swordPositionXLeverId);
	newLeverValues.push(middleX);

	leverIds.push(swordPositionYLeverId);
	newLeverValues.push(middleY);
}

// return distance for 2 kitties
function getDistanceForKitties(kittyA, kittyB) {
	var x1 = kittyA.x;
	var y1 = kittyA.y;

	var x2 = kittyB.x;
	var y2 = kittyB.y;

	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Return true if kitties both show hearts
function checkForValidHearts(kittyA, kittyB) {
	return ((kittyA.emote === EMOTE_HEART) && (kittyB.emote === EMOTE_HEART));
}

// Return true if kitties have opposite eth/btc emotes
function checkForValidFight(kittyA, kittyB) {
	if ((kittyA.emote === EMOTE_ETH) && (kittyB.emote === EMOTE_BTC)) {
		return true;
	} else if ((kittyA.emote === EMOTE_BTC) && (kittyB.emote === EMOTE_ETH)) {
		return true;
	}

	return false;
}

exports.update = update