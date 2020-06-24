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
			if (distanceForKitties(kittyA, kittyB) <= MAX_KITTY_DISTANCE_FOR_INTERACTION) {
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

	console.log(leverIds);
	console.log(newLeverValues);

	return {
		leverIds : leverIds,
		leverValues : newLeverValues
	}
}

function distanceForKitties(kittyA, kittyB) {
	var x1 = kittyA.x;
	var y1 = kittyA.y;

	var x2 = kittyB.x;
	var y2 = kittyB.y;

	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function checkForValidHearts(kittyA, kittyB) {
	return ((kittyA.emote === EMOTE_BTC) && (kittyB.emote === EMOTE_BTC));
}

function checkForValidFight(kittyA, kittyB) {
	return true;
}

// exports.update = update
var providerURL = "https://rinkeby.infura.io/v3/687d696aa0a440ceadfb06bf931cfe06"
var contractAddress = "0x96222c40d9dbfb9f62d73bd5f1ded9c7c9190118"
var contractABI = [{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"bidAmount","type":"uint256"},{"indexed":false,"internalType":"address","name":"bidder","type":"address"}],"name":"BidProposed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"BidWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"BuyPriceSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"priorityTip","type":"uint256"},{"indexed":false,"internalType":"uint256[]","name":"leverIds","type":"uint256[]"},{"indexed":false,"internalType":"int256[]","name":"previousValues","type":"int256[]"},{"indexed":false,"internalType":"int256[]","name":"updatedValues","type":"int256[]"}],"name":"ControlLeverUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"platformAddress","type":"address"}],"name":"PlatformAddressUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"platformFirstPercentage","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"platformSecondPercentage","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"artistSecondPercentage","type":"uint256"}],"name":"RoyaltyAmountUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"salePrice","type":"uint256"},{"indexed":false,"internalType":"address","name":"buyer","type":"address"}],"name":"TokenSale","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"artistSecondSalePercentage","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"buyPrices","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"expectedTokenSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"pendingBids","outputs":[{"internalType":"address payable","name":"bidder","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bool","name":"exists","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"permissionedControllers","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"platformAddress","outputs":[{"internalType":"address payable","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"platformFirstSalePercentage","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"platformSecondSalePercentage","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"tokenDidHaveFirstSale","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"uniqueTokenCreators","outputs":[{"internalType":"address payable","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"whitelistedCreators","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"creator","type":"address"},{"internalType":"bool","name":"state","type":"bool"}],"name":"updateWhitelist","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address payable","name":"newPlatformAddress","type":"address"}],"name":"updatePlatformAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"_platformFirstSalePercentage","type":"uint256"},{"internalType":"uint256","name":"_platformSecondSalePercentage","type":"uint256"},{"internalType":"uint256","name":"_artistSecondSalePercentage","type":"uint256"}],"name":"updateRoyaltyPercentages","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"controlTokenId","type":"uint256"},{"internalType":"string","name":"controlTokenURI","type":"string"},{"internalType":"int256[]","name":"leverMinValues","type":"int256[]"},{"internalType":"int256[]","name":"leverMaxValues","type":"int256[]"},{"internalType":"int256[]","name":"leverStartValues","type":"int256[]"},{"internalType":"address payable[]","name":"additionalCollaborators","type":"address[]"}],"name":"setupControlToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"artworkTokenId","type":"uint256"},{"internalType":"string","name":"artworkTokenURI","type":"string"},{"internalType":"address payable[]","name":"controlTokenArtists","type":"address[]"}],"name":"mintArtwork","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"bid","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"withdrawBid","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"takeBuyPrice","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"acceptBid","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"makeBuyPrice","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"controlTokenId","type":"uint256"}],"name":"getControlToken","outputs":[{"internalType":"int256[]","name":"","type":"int256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"permissioned","type":"address"}],"name":"grantControlPermission","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"controlTokenId","type":"uint256"},{"internalType":"uint256[]","name":"leverIds","type":"uint256[]"},{"internalType":"int256[]","name":"newValues","type":"int256[]"}],"name":"useControlToken","outputs":[],"payable":true,"stateMutability":"payable","type":"function"}]

update(providerURL, contractAddress, contractABI);