function update() {	
	/*
	* 0 = Sun State
	* 1 = Sword1 Visibility
	* 2 = Sword1 Position X
	* 3 = Sword1 Position Y
	* (repeated for all 5 swords)
	*/
	var leverIds = [];
	var newLeverValues = []; 

	// Determine pairs of kitties that are close enough to be valid (heart x heart, ETH/BTC x BTC/ETH)

	// Check if any pairs have hearts, if so then display the heart sun, otherwise normal sun

	// Check pairs for ETH/BTC and place an available sword between them

	console.log(leverIds);
	console.log(newLeverValues);

	return {
		leverIds : leverIds,
		leverValues : newLeverValues
	}
}

exports.update = update