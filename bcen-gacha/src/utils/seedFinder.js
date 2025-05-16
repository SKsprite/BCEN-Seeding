/**
 * Ported from C++ Battle Cats gacha seed finder
 */

export function seedIter(seed, modulo) {
	seed ^= seed << 13;
	seed >>>= 0;
	seed ^= seed >>> 17;
	seed >>>= 0;
	seed ^= seed << 15;
	seed >>>= 0;
	return [seed, seed % modulo];
}

function rem1(x, chances) {
	x = Math.abs(x % 10000);
	const [superRareChance, uberRareChance, legendaryRareChance] = chances;
	if (x >= legendaryRareChance) return 3;
	if (x >= uberRareChance) return 2;
	if (x >= superRareChance) return 1;
	return 0;
}

function getSlot(rarity, counts) {
	const [numberRare, numberSuperRare, numberUber, numberLegend] = counts;
	switch (rarity) {
		case 0: return numberRare;
		case 1: return numberSuperRare;
		case 2: return numberUber;
		default: return numberLegend;
	}
}

/**
 * @param {number} begin - starting seed to test
 * @param {number} end - ending seed to test
 * @param {number[]} counts - [rare, super, uber, legend]
 * @param {number[]} chances - [super, uber, legend] thresholds
 * @param {Array<[rarity, slot]>} catList
 * @returns {[number, number]} - [matchingSeed, finalSeedValue]
 */
export function calculateSeedThread(begin, end, counts, chances, catList) {
	for (let i = begin; i < end; i++) {
		let currentSeed = i;
		let currentPair = [currentSeed, 0];

		for (let j = 0; j < catList.length; j++) {
			currentPair[1] = 10000;
			currentPair = seedIter(currentPair[0], currentPair[1]);
			const rarity = rem1(currentPair[1], chances);

			currentPair[1] = getSlot(rarity, counts);
			currentPair = seedIter(currentPair[0], currentPair[1]);

			const [expectedRarity, expectedSlot] = catList[j];

			if (expectedRarity < 4 && rarity !== expectedRarity) break;

			if (currentPair[1] !== expectedSlot) {
				if (expectedRarity > 3) continue;
				else {
					if (j === 0) break;
					if (rarity === catList[j - 1][0] && rarity === 0) {
						const oldSlot = currentPair[1];
						currentPair = seedIter(currentPair[0], counts[0] - 1);
						if (currentPair[1] > oldSlot) {
							currentPair[1] = (currentPair[1] + 1) % counts[0];
						}
						if (currentPair[1] !== expectedSlot) break;
					} else break;
				}
			}

			if (j === catList.length - 1) {
				return [i, currentPair[0]];
			}
		}
	}
	return [0, 0];
}
