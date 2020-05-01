function update() {
	var leverIds = [];
	var newLeverValues = [];

	// Layer Ids
	// this layer only has 1 lever
	leverIds.push(0);

	// get UTC time
	var utcNow = new Date(Date.now());

	console.log("UTC Time = " + utcNow.toUTCString())
	
	// get UTC hours
	var utcHours = utcNow.getUTCHours();

	console.log("UTC Hours = " + utcHours);
	
	if (utcHours == 7) { // 7am
		newLeverValues.push(0);
	} else if (utcHours == 10) { // 10am
		newLeverValues.push(1);
	} else if (utcHours == 13) { // 1pm
		newLeverValues.push(2);
	} else if (utcHours == 16) { // 4pm
		newLeverValues.push(3);
	} else if (utcHours == 19) { // 7pm
		newLeverValues.push(4);
	} else if (utcHours == 22) { // 10pm
		newLeverValues.push(5);
	}

	return {
		leverIds : leverIds,
		leverValues : newLeverValues
	}
}

exports.update = update