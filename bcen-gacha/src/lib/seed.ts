// /lib/seed.ts
export const advanceSeed = (seed: number): number => {
	const next = (seed * 0x41C64E6D + 0x6073) >>> 0;
	return next & 0xFFFFFFFF;
};
