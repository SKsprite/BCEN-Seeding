"use client"
import { useEffect, useState } from 'react';
import { loadYamlClient } from '@/utils/loadYaml';

export default function GachaViewer() {
	const [gachaCats, setGachaCats] = useState<number[][] | null>(null);

	useEffect(() => {
		async function loadData() {
			const data = await loadYamlClient();
			const list = data.gacha?.[964]?.cats.map((id: number, index: number) => {
				const rarity = data.cats?.[id]?.rarity ?? 0;
				const name = data.cats?.[id]?.name[0] ?? undefined;
				return [rarity, id, name];
			});
			setGachaCats(list);
		}

		loadData();
	}, []);

	if (!gachaCats) return <div>Loading...</div>;

	return (
		<ul>
			{gachaCats.map(([rarity, id, name], i) => (
				<li key={i}>Rarity {rarity} #{id}: {name}</li>
			))}
		</ul>
	);
}
