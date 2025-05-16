// utils/loadYamlClient.ts
import yaml from 'js-yaml';
import seedrandom from 'seedrandom';

let cachedYamlData: any = null;
let cachedCats: any = null;
let cachedGacha: any = null;
let cachedEvents: any = null;
export let cachedSeed: any = null;


export async function loadYamlClient(): Promise<any> {
	if (cachedYamlData) return cachedYamlData;

	const res = await fetch('/bc-en.yaml');
	const text = await res.text();
	cachedYamlData = yaml.load(text);
	return cachedYamlData;
}

export async function getCats(): Promise<any> {
	if (!cachedYamlData) await loadYamlClient();
	if (cachedCats) return cachedCats;

	cachedCats = cachedYamlData.cats;
	return cachedCats;
}

export async function getGacha(): Promise<any> {
	if (!cachedYamlData) await loadYamlClient();
	if (cachedGacha) return cachedGacha;

	cachedGacha = cachedYamlData.gacha;
	return cachedGacha;
}

export async function getEvents(): Promise<any> {
	if (!cachedYamlData) await loadYamlClient();
	if (cachedEvents) return cachedEvents;

	cachedEvents = cachedYamlData.events;
	return cachedEvents;
}

export async function setSeed(seed: string): Promise<any> {
	cachedSeed = seedrandom(seed)
	return cachedSeed
}

export async function getCatList(gachaID: number): Promise<any> {
	if (!cachedYamlData) await loadYamlClient();

	const cats = cachedYamlData.gacha?.[gachaID]?.cats;
	if (!cats) return [];

	return cats.map((id: number, index: number) => {
		const cat = cachedYamlData.cats?.[id] || {};
		const rarity = cat.rarity ?? 0;
		const name = cat.name?.[0] ?? undefined;
		return [rarity, id, name];
	});
}