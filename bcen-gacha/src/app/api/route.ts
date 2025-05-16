// /app/api/test/route.ts
import { NextResponse } from 'next/server';
import { buildChance, buildRolls } from '@/lib/roll';
import { seekRange, SeekStep } from '@/lib/seeker';

export async function GET() {
	const chance = buildChance(7000, 2500, 500, 0, 23, 16, 4, 0);
	const picks = buildRolls([chance.rare, chance.supa, chance.uber, chance.legend], [
		2, 15, 2, 10, 2, 20, 2, 22, 2, 1, 2, 5, 2, 2, 2, 16, 3, 2, 2, 10
	]);

	const step: SeekStep = [0, picks] as const;
	const result = seekRange(step, 0, 0xFFFFFFFF);

	return NextResponse.json({ result });
}
