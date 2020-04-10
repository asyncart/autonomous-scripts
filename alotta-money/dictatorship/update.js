var fs = require('fs')

const SKY_STATE_ID = 0;
const SKY_POSITION_X_ID = 1;

const NPC_A_STATE = 2;

const SATURDAY_WINDOW_STATE_ID = 3;

const NPC_B_STATE = 4;
const NPC_C_STATE = 5;

const DRUG_BUS_VISIBLE_ID = 6;
const DRUG_BUS_POSITION_X = 7;
const DRUG_DEALER_STATE_ID = 8;

const VEHICLE_STATE_ID = 9;
const VEHICLE_POSITION_X_ID = 10;

const NPC_D_STATE = 11;
const NPC_E_STATE = 12;
const NPC_F_STATE = 13;
const NPC_G_STATE = 14;
const NPC_H_STATE = 15;

const POSTER_STATE_ID = 16;

const NPC_I_STATE = 17;
const NPC_J_STATE = 18;
const NPC_K_STATE = 19;
const NPC_L_STATE = 20;

const SATURDAY_BROTHEL_STATE_ID = 21;
const CAMERA_STATE = 22;

const NPC_M_STATE = 23;
const NPC_N_STATE = 24;
const NPC_O_STATE = 25;
const NPC_P_STATE = 26;

const WINDOW_A_STATE = 27;
const WINDOW_B_STATE = 28;
const WINDOW_C_STATE = 29;
const WINDOW_D_STATE = 30;
const WINDOW_E_STATE = 31;
const WINDOW_F_STATE = 32;

const FRAME_STATE_ID = 33;

function randomInt(sides) {
	return Math.floor(Math.random() * sides);
}

function update() {
	var now = new Date(Date.now());

	// optionally set timezone here and use local time if desired 
	var day = now.getUTCDay();
	var month = now.getUTCMonth();

	var isSunday = (day == 0);
	var isSaturday = (day == 6);
	var isWeekend = (isSunday || isSaturday);

	console.log("Month = " + month + ", Day of Week = " + day);

	var isWinter = ((month == 11) || (month == 0) || (month == 1));
	console.log("IsWinter = " + isWinter);

	var leverIds = [];
	var newLeverValues = [];

	// seasons
	leverIds.push(FRAME_STATE_ID)
	if (isWinter) {
		newLeverValues.push(1); // winter frame
	} else {
		newLeverValues.push(0); // normal frame
	}

	// vehicles
	leverIds.push(VEHICLE_STATE_ID);
	if (isSunday) {
		newLeverValues.push(10); // vehicles hidden on sunday
	} else {
		newLeverValues.push(randomInt(10));

		// move vehicle to random X position
		leverIds.push(VEHICLE_POSITION_X_ID);
		newLeverValues.push(-100 + randomInt(600)); // -500 to 500
	}

	// cameras
	leverIds.push(CAMERA_STATE);
	newLeverValues.push(randomInt(4));

	// windows
	leverIds.push(SATURDAY_WINDOW_STATE_ID);
	leverIds.push(SATURDAY_BROTHEL_STATE_ID);
	if (isSaturday) {
		newLeverValues.push(0);
		newLeverValues.push(0);		
	} else {
		newLeverValues.push(1);
		newLeverValues.push(1);
	}

	var maxWindowsOn = 3;
	var numWindowsOn = randomInt(maxWindowsOn + 1)

	console.log("Num Windows On = " + numWindowsOn);

	var windowIdsOff = [WINDOW_A_STATE, WINDOW_B_STATE, WINDOW_C_STATE, WINDOW_D_STATE, WINDOW_E_STATE, WINDOW_F_STATE]
	var windowIdsOn = [];	
	// choose a determined amount of windows to turn on
	for (var i = 0; i < numWindowsOn; i++) {
		var random = randomInt(windowIdsOff.length);

		// turn on this window
		leverIds.push(windowIdsOff[random]);
		newLeverValues.push(0);
		
		// splice out this window ID
		windowIdsOff.splice(random, 1);
	}
	// iterate through the rest of the remaining windows and turn them off
	for (var i = 0; i < windowIdsOff.length; i++) {
		// turn off window
		leverIds.push(windowIdsOff[i]);
		newLeverValues.push(1); // hidden	
	}

	// NPCs
	var maxNPCsOn = 4;
	if (isWeekend) {
		maxNPCsOn = 0;
	}
	console.log("Num NPCs on = " + maxNPCsOn);

	var npcsOff = [NPC_A_STATE, NPC_B_STATE, NPC_C_STATE, NPC_D_STATE, NPC_E_STATE, NPC_F_STATE, NPC_G_STATE, NPC_H_STATE, NPC_I_STATE,
		NPC_J_STATE, NPC_K_STATE, NPC_L_STATE, NPC_M_STATE, NPC_N_STATE, NPC_O_STATE, NPC_P_STATE];
	var npcsOn = [];
	for (var i = 0; i < maxNPCsOn; i++) {
		var random = randomInt(npcsOff.length);

		// turn on this NPC
		leverIds.push(npcsOff[random]);
		newLeverValues.push(0);
		
		// splice out this window ID
		npcsOff.splice(random, 1);
	}
	// iterate through the rest of the remaining NPCs and turn them off
	for (var i = 0; i < npcsOff.length; i++) {
		// turn off NPC
		leverIds.push(npcsOff[i]);
		newLeverValues.push(1); // hidden	
	}

	// Sky
	leverIds.push(SKY_STATE_ID);
	newLeverValues.push(randomInt(5)); // random sky state

	leverIds.push(SKY_POSITION_X_ID);
	newLeverValues.push(-700 + randomInt(1500)); // random sky position

	// Poster
	leverIds.push(POSTER_STATE_ID);
	newLeverValues.push(month);

	// Drug Bus State
	// Drug Bus only visible on Sundays
	leverIds.push(DRUG_BUS_VISIBLE_ID)
	if (isSunday) {
		newLeverValues.push(0);

		leverIds.push(DRUG_BUS_POSITION_X);
		newLeverValues.push(-700 + randomInt(1300));

		// show dealer
		leverIds.push(DRUG_DEALER_STATE_ID);
		newLeverValues.push(0);
	} else {
		newLeverValues.push(1);

		// hide dealer
		leverIds.push(DRUG_DEALER_STATE_ID);
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

// var cachePath = "cache.json"
// let cache = JSON.parse(fs.readFileSync(cachePath));
// var controlToken = cache[1];

// for (var i = 0; i < leverIds.length; i++) {
// 	var id = leverIds[i];
// 	var value = newLeverValues[i];

// 	var index = id * 3 + 2;
// 	controlToken[index] = value;
// }

// // write cache file
// let data = JSON.stringify(cache);
// fs.writeFileSync(cachePath, data);

// console.log("Randomized to " + cachePath);