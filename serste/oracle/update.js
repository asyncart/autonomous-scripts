var moment = require('moment-timezone');

function update() {
	// 0 = State, 1 = Visibility
	var leverIds = [];

	var newLeverValues = [];

	// get time
	var tzMoment = moment().tz("Europe/Rome");

	var date = tzMoment.date();
	var hours = tzMoment.hours();
	
	console.log("Date = " + date + ", Hours = " + hours);

	// state lever
	leverIds.push(0); 

	if (date == 6) { // If it's the 6th day of the month...
		if (hours >= 18) { // and 6pm or later			
			newLeverValues.push(0); // Positive Apollo 50
		}
	} else if (date == 7) { // If it's the 7th day of the month...
		newLeverValues.push(1); // Positive Apollo 100
	} else if (date == 8) { // If it's the 8th day of the month...
		if (hours <= 18) { // and before 6pm
			newLeverValues.push(1); // Positive Apollo 100
		}
	}

	// if there's no state pushed
	if (newLeverValues.length == 0) {
		newLeverValues.push(2); // Positive Apollo 0
	}

	// ensure that the visible toggle is turned on
	leverIds.push(1);
	newLeverValues.push(1); 

	console.log(leverIds);
	console.log(newLeverValues);

	return {
		leverIds : leverIds,
		leverValues : newLeverValues
	}
}

exports.update = update