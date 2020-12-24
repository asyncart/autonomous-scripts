var ethers = require("ethers");

const MASTER_TOKEN_ID = 293; // 740

const CONTROL_TOKEN 		= MASTER_TOKEN_ID + 15;

const KITTY_COSMIC_KITTY 	= MASTER_TOKEN_ID + 1;
const KITTY_CATSQUERADE 	= MASTER_TOKEN_ID + 2;
const KITTY_CAT_NAMED_CHIBS = MASTER_TOKEN_ID + 3;
const KITTY_SWIRL 			= MASTER_TOKEN_ID + 4;
const KITTY_JOHNNY 			= MASTER_TOKEN_ID + 5;
const KITTY_BILLY 			= MASTER_TOKEN_ID + 6;
const KITTY_CHAMELEON 		= MASTER_TOKEN_ID + 7;
const KITTY_KITTEH_CLAN 	= MASTER_TOKEN_ID + 8;
const KITTY_FRANKEN_KITTY 	= MASTER_TOKEN_ID + 9;
const KITTY_REZ_CATS 		= MASTER_TOKEN_ID + 10;
const KITTY_CYBERCAT 		= MASTER_TOKEN_ID + 11;
const KITTY_BATTLE_KITTIES 	= MASTER_TOKEN_ID + 12;
const KITTY_FAUVES 			= MASTER_TOKEN_ID + 13;
const KITTY_PURRRDOCK 		= MASTER_TOKEN_ID + 14;

const OPACITY_DECREASE_PER_DAY = 5;
const MIN_OPACITY = 25;
const MAX_OPACITY = 100;

const ALL_KITTIES = [KITTY_COSMIC_KITTY, KITTY_CATSQUERADE, KITTY_CAT_NAMED_CHIBS, KITTY_SWIRL, KITTY_JOHNNY, KITTY_BILLY,
	KITTY_CHAMELEON, KITTY_KITTEH_CLAN, KITTY_FRANKEN_KITTY, KITTY_REZ_CATS, KITTY_CYBERCAT, KITTY_BATTLE_KITTIES, KITTY_FAUVES, KITTY_PURRRDOCK];

let contractV1;
let contractV2;

function getKittyLeverID(kittyID) {
	return kittyID - MASTER_TOKEN_ID - 1;	
}

function getKittyOpacity(kittyOpacities, kittyID) {
	var kittyLever = getKittyLeverID(kittyID);

	var index = kittyLever * 3 + 2;
	
	return parseInt(kittyOpacities[index].toString());
}

async function update(providerURL, contractAddressV1, contractAddressV2, contractABI) {	
	let provider = new ethers.providers.JsonRpcProvider(providerURL)

	var latestBlock = await provider.getBlockNumber();

	let fromBlock = latestBlock - (4 * 60 * 24); // 4 tx/min x 24 hours
	
	contractV1 = new ethers.Contract(contractAddressV1, contractABI, provider);
	contractV2 = new ethers.Contract(contractAddressV2, contractABI, provider);
	
	let topicV1 = ethers.utils.id("ControlLeverUpdated(uint256,uint256,uint256[],int256[],int256[])");
	console.log("Fetching logs from " + fromBlock + " to " +  latestBlock);
	let filterV1 = {
	    address: contractAddressV1,
	    fromBlock: fromBlock,
	    toBlock: latestBlock,
	    topics: [ topicV1 ]
	}
	let result_v1 = await provider.getLogs(filterV1);

	let topicV2 = ethers.utils.id("ControlLeverUpdated(uint256,uint256,int256,uint256[],int256[],int256[])");
	console.log("Fetching logs from " + fromBlock + " to " +  latestBlock);
	let filterV2 = {
	    address: contractAddressV2,
	    fromBlock: fromBlock,
	    toBlock: latestBlock,
	    topics: [ topicV2 ]
	}
	let result_v2 = await provider.getLogs(filterV2);

	return await parseResults(result_v1, result_v2);
}

async function parseResults(result_v1, result_v2) {
	var leverIds = [];
	var newLeverValues = []; 

	var setPreviouslyUsedTokens = new Set();

	for (var i = 0; i < result_v1.length; i++) {    		
		var decoded = ethers.utils.defaultAbiCoder.decode(
			[ 'uint256', 'uint256', 'uint256[]', 'int256[]', 'int256[]' ],
			result_v1[i].data
		);

		var tokenId = parseInt(decoded[0].toString()); // first parameter is the token id

		console.log(tokenId)

		setPreviouslyUsedTokens.add(tokenId);
	}

	for (var i = 0; i < result_v2.length; i++) {    		
		var decoded = ethers.utils.defaultAbiCoder.decode(
			[ 'uint256', 'uint256', 'int256', 'uint256[]', 'int256[]', 'int256[]' ],
			result_v2[i].data
		);

		var tokenId = parseInt(decoded[0].toString()); // first parameter is the token id

		console.log(tokenId)

		setPreviouslyUsedTokens.add(tokenId);
	}

	console.log(setPreviouslyUsedTokens)

	return;

	var kittiesNotMoved = [];
	var kittiesThatMoved = [];    	

	for (var i = 0; i < ALL_KITTIES.length; i++) {
		var kittyID = ALL_KITTIES[i];

		if (setPreviouslyUsedTokens.has(kittyID)) {
			console.log("Kitty was moved: " + kittyID);

			kittiesThatMoved.push(kittyID);
		} else {
			console.log("Kitty DID NOT move: " + kittyID);

			kittiesNotMoved.push(kittyID);
		}
	}

	// fetch all the kitty opacity values
	var kittyOpacities = await contract.getControlToken(CONTROL_TOKEN);

	// for all the kitties that didn't move, decrease their opacity
	for (var i = 0; i < kittiesNotMoved.length; i++) {
		var kittyID = kittiesNotMoved[i];

		// get the kitty opacity
		var currentOpacity = getKittyOpacity(kittyOpacities, kittyID);

		var newOpacity = Math.max(currentOpacity - OPACITY_DECREASE_PER_DAY, MIN_OPACITY);

		leverIds.push(getKittyLeverID(kittyID));
		newLeverValues.push(newOpacity);
	}

	// for all the kitties that did move, reset their opacity
	for (var i = 0; i < kittiesThatMoved.length; i++) {
		var kittyID = kittiesThatMoved[i];

		leverIds.push(getKittyLeverID(kittyID));
		newLeverValues.push(MAX_OPACITY);
	}

	console.log(leverIds);
	console.log(newLeverValues);

	return {
		leverIds : leverIds,
		leverValues : newLeverValues
	}
}

exports.update = update