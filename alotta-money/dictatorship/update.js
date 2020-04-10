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

	var isWinter = ((month == 12) || (month == 0) || (month == 1));
	console.log("IsWinter = " + isWinter);

	var layerIds = [];
	var newLayerValues = [];

	// seasons
	layerIds.push(FRAME_STATE_ID)
	if (isWinter) {
		newLayerValues.push(1); // winter frame
	} else {
		newLayerValues.push(0); // normal frame
	}

	// vehicles
	layerIds.push(VEHICLE_STATE_ID);
	if (isSunday) {
		newLayerValues.push(10); // vehicles hidden on sunday
	} else {
		newLayerValues.push(randomInt(10));

		// move vehicle to random X position
		layerIds.push(VEHICLE_POSITION_X_ID);
		newLayerValues.push(-500 + randomInt(1000));
	}

	// cameras
	layerIds.push(CAMERA_STATE);
	newLayerValues.push(randomInt(4));

	// windows
	layerIds.push(SATURDAY_WINDOW_STATE_ID);
	layerIds.push(SATURDAY_BROTHEL_STATE_ID);
	if (isSaturday) {
		newLayerValues.push(0);
		newLayerValues.push(0);		
	} else {
		newLayerValues.push(1);
		newLayerValues.push(1);
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
		layerIds.push(windowIdsOff[random]);
		newLayerValues.push(0);
		
		// splice out this window ID
		windowIdsOff.splice(random, 1);
	}
	// iterate through the rest of the remaining windows and turn them off
	for (var i = 0; i < windowIdsOff.length; i++) {
		// turn off window
		layerIds.push(windowIdsOff[i]);
		newLayerValues.push(1); // hidden	
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
		layerIds.push(npcsOff[random]);
		newLayerValues.push(0);
		
		// splice out this window ID
		npcsOff.splice(random, 1);
	}
	// iterate through the rest of the remaining NPCs and turn them off
	for (var i = 0; i < npcsOff.length; i++) {
		// turn off NPC
		layerIds.push(npcsOff[i]);
		newLayerValues.push(1); // hidden	
	}

	// Sky
	layerIds.push(SKY_STATE_ID);
	newLayerValues.push(randomInt(5)); // random sky state

	layerIds.push(SKY_POSITION_X_ID);
	newLayerValues.push(-700 + randomInt(1500)); // random sky position

	// Poster
	layerIds.push(POSTER_STATE_ID);
	newLayerValues.push(month);

	// Drug Bus State
	// Drug Bus only visible on Sundays
	layerIds.push(DRUG_BUS_VISIBLE_ID)
	if (isSunday) {
		newLayerValues.push(0);

		layerIds.push(DRUG_BUS_POSITION_X);
		newLayerValues.push(-700 + randomInt(1300));

		// show dealer
		layerIds.push(DRUG_DEALER_STATE_ID);
		newLayerValues.push(0);
	} else {
		newLayerValues.push(1);

		// hide dealer
		layerIds.push(DRUG_DEALER_STATE_ID);
		newLayerValues.push(1);
	}

	console.log(layerIds);
	console.log(newLayerValues)

	return {
		leverIds : leverIds,
		layerValues : newLayerValues
	}
}

exports.update = update