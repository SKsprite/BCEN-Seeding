// /lib/types.ts
export type Seed = number;

export interface Rarity {
	begin: number;
	end: number;
	count: number;
}

export type Slot = number | [number, number]; // Single or dual slot

export interface Roll {
	rarity: Rarity;
	slot: Slot;
}

export interface Chance {
	rare: Rarity;
	supa: Rarity;
	uber: Rarity;
	legend: Rarity;
}

export interface Source {
	version: string;
	picks: Roll[];
}
