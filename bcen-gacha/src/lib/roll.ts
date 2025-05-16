// /lib/roll.ts
import { Chance, Rarity, Roll, Slot } from './types';

export const scoreBase = 10000;

export const buildChance = (r: number, s: number, u: number, l: number, rCount: number, sCount: number, uCount: number, lCount: number): Chance => ({
	rare:   { begin: 0, end: r, count: rCount },
	supa:   { begin: r, end: r + s, count: sCount },
	uber:   { begin: r + s, end: r + s + u, count: uCount },
	legend: { begin: r + s + u, end: scoreBase, count: lCount },
});

export const buildRolls = (rarities: Rarity[], data: number[]): Roll[] => {
	const rolls: Roll[] = [];
	for (let i = 0; i < data.length; i += 2) {
		const rarityIndex = data[i] - 2;
		const slot = data[i + 1];
		const rarity = rarities[rarityIndex];
		rolls.push({ rarity, slot });
	}
	return rolls;
};

export const dupeCode = (rarity: Rarity, code: number): number => {
	return code === rarity.count - 1 ? 0 : code + 1;
};
