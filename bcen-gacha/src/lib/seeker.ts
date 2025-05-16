// /lib/seeker.ts
import { Seed, Roll } from './types';
import { advanceSeed } from './seed';

export type SeekStep = [number, Roll[]];

export const matchPick = (seed: number, pick: Roll): number | null => {
	const rand = (seed >>> 16) % 10000;

	if (rand >= pick.rarity.begin && rand < pick.rarity.end) {
		return seed;
	}
	return null;
};

export const matchSeed = (step: SeekStep, seed: number): number | null => {
	const [_, picks] = step;

	let currentSeed = advanceSeed(seed);
	for (const pick of picks) {
		const result = matchPick(currentSeed, pick);
		if (result == null) return null;
		currentSeed = advanceSeed(result);
	}
	return seed;
};

export const seekRange = (step: SeekStep, start: number, end: number): [number, number] | null => {
	for (let i = start; i <= end; i++) {
		const match = matchSeed(step, i);
		if (match !== null) {
			return [i, match];
		}
	}
	return null;
};
