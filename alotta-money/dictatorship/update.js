const axios = require('axios');
var fs = require('fs')

const DRUG_BUS_VISIBLE_ID = 6;
const FRAME_STATE_ID = 33;

async function run() {
	var now = new Date(Date.now());

	var isSunday = (now.getUTCDay() == 0);

	var utcMonth = now.getUTCMonth();
	var isWinter = ((utcMonth == 12) || (utcMonth == 0) || (utcMonth == 1));

	var layerIds = [];
	var newLayerValues = [];

	// seasons
	layerIds.push(FRAME_STATE_ID)
	if (isWinter) {
		newLayerValues.push(1);
	} else {
		newLayerValues.push(0);
	}

	// TODO vehicles

	// TODO cameras

	// TODO windows

	// TODO NPC

	// TODO Sky

	// TOD Poster

	// Drug Bus State
	// Drug Bus only visible on Sundays
	layerIds.push(DRUG_BUS_VISIBLE_ID)
	if (isSunday) {
		newLayerValues.push(0);
	} else {
		newLayerValues.push(1);
	}

	console.log(layerIds);
	console.log(newLayerValues)

	var cachePath = "cache.json"
	let cache = JSON.parse(fs.readFileSync(cachePath));
	var controlToken = cache[1];

	for (var i = 0; i < layerIds.length; i++) {
		var id = layerIds[i];
		var value = newLayerValues[i];

		var index = id * 3 + 2;
		controlToken[index] = value;
	}

	// write cache file
	let data = JSON.stringify(cache);
	fs.writeFileSync(cachePath, data);

	console.log("Randomized to " + cachePath);
}

run();