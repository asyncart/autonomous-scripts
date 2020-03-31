function update() {
	var layerIds = [];
	var newLayerValues = [];

	// Layer Ids
	layerIds.push(0); // Ground
	layerIds.push(1); // Sky

	// State IDs (Ground)
	var groundDay = [0, 1, 2, 3]
	var groundNight = [4, 5, 6, 7]

	// State IDs (Sky)
	var skyDay = [0, 1, 2, 3]
	var skyNight = [4, 5, 6, 7]

	// get UTC time
	var utcNow = new Date(Date.now());

	console.log("UTC Time = " + utcNow.toUTCString())
	
	var utcHours = utcNow.getUTCHours();

	var isDay = ((utcHours >= 6) && (utcHours < 18)); // Day is from 6am to 6pm (exclusive)

	console.log("IsDay = " + isDay)

	if (isDay) {
		var randomGround = Math.floor(Math.random() * groundDay.length);
		newLayerValues.push(groundDay[randomGround]);

		var randomSky = Math.floor(Math.random() * skyDay.length);
		newLayerValues.push(skyDay[randomSky]);
	} else {
		var randomGround = Math.floor(Math.random() * groundNight.length);
		newLayerValues.push(groundNight[randomGround]);

		var randomSky = Math.floor(Math.random() * skyNight.length);
		newLayerValues.push(skyNight[randomSky]);
	}

	return {
		layerIds : layerIds,
		layerValues : newLayerValues
	}
}

exports.update = update