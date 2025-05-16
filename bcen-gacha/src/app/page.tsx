'use client';

import { useEffect, useState } from 'react';
import { getCats, getEvents, getGacha } from '@/utils/loadYaml'

type GachaResult = {
	id: string;
	rarity: string;
	name: string;
	form: string;
	trueForm: string;
	ultraForm: string;
} | null;

const legend = {
        "5": 'Legend Rare',
        "4": 'Uber Rare',
        "3": 'Super Rare',
        "2":'Rare'
} as const;

type LegendKey = keyof typeof legend;

export default function Home() {
	const [seedID, setSeedID] = useState('');
	const [eventID, setEventID] = useState('');
	const [result, setResult] = useState<{ description: string; seed: number }[] | string | null>(null);

    // new state for toggling columns
    const [showA, setShowA] = useState(true);
    const [showB, setShowB] = useState(true);

    // const handleSearch = async () => {
    //     try {
    //         const cats = await getCats();
    //         const allEvents = await getEvents();
    //         const allGacha = await getGacha();
    
    //         const event = allEvents[`${eventID}`];
    //         const gacha = allGacha[eventID.split("_")[1]];
    //         console.log("eventID", eventID.split("_")[1]);
    
    //         if (!event || !gacha) throw new Error('Invalid event ID');
    
    //         const rates = {
    //             rare: event.rare ?? 0,
    //             supa: event.supa ?? 0,
    //             uber: event.uber ?? 0,
    //             legend: event.legend ?? 0,
    //         };

    //         console.log("rates",rates)
    
    //         const totalRate = rates.rare + rates.supa + rates.uber + rates.legend;
    
    //         let seed = seedIter(Number(seedID));
    //         // Each pull: { description: string, seedAfterPull: number }
    //         const pulls: { description: string; seed: number }[] = [];
    
    //         for (let i = 0; i < 100; i++) {
    //             let rarityRoll = seed % totalRate;
    //             let chosenRarity = '';
    //             if (rarityRoll < rates.legend) {
    //                 chosenRarity = '5';
    //             } else if (rarityRoll < rates.legend + rates.uber) {
    //                 chosenRarity = '4';
    //             } else if (rarityRoll < rates.legend + rates.uber + rates.supa) {
    //                 chosenRarity = '3';
    //             } else {
    //                 chosenRarity = '2';
    //             }
    
    //             const selectedRarity = legend[chosenRarity as LegendKey];
    
    //             const pool = gacha.cats
    //                 .map((id: number) => [cats[id.toString()], id])
    //                 .filter(([cat, _]: any) => cat?.rarity.toString() === chosenRarity)
    //                 .sort((a: any, b: any) => a[1] - b[1])
    //                 // .sort((a: any, b: any) => b[1] - a[1]);
                
    //             console.log(pool.map((cat: any) => cat[0].name[0]));
    
    //             if (pool.length === 0) {
    //                 pulls.push({ description: `No cats found for rarity ${chosenRarity}`, seed: seed });
    //                 seed = seedIter(seed); // advance seed anyway
    //                 continue;
    //             }
    
    //             seed = seedIter(seed);
    //             let catIndex = seed % pool.length;
    //             let [chosenCat, catID] = pool[catIndex];
    
    //             const description = `#${catID} ${chosenCat.name} (${selectedRarity}) - current seed: ${seed}`;
    
    //             pulls.push({ description, seed: seed });
    //         }
    
    //         setResult(pulls);
    //     } catch (err) {
    //         console.error(err);
    //         setResult(`Error loading cat data: ${err}`);
    //     }
    // };

    const handleSearch = async () => {
        try {
            // Prepare an empty array for our pulls
            type Pull = { description: string; seed: number };
            const pulls: Pull[] = [];
        
            // 1. Fetch from your API endpoint
            const response = await fetch(
                `/api/gacha?eventKey=${encodeURIComponent(eventID)}&seed=${encodeURIComponent(seedID)}&count=200`
            );
        
            // 2. Parse the JSON body
            const data = (await response.json()) as {
                results: Array<{ id: number; name: string; rarity: string; seed: number }>;
            };
            // 3. Iterate over each result using for…of :contentReference[oaicite:4]{index=4}
            for (const unit of data.results) {
                // If your API now returns unit.seed, use it; otherwise omit or replace with the next seed
                const description = `#${unit.id} ${unit.name} (${unit.rarity})` +
                                    (unit.seed ? ` - current seed: ${unit.seed}` : '');
                pulls.push({ description, seed: unit.seed });
            }
        
            // 4. Update state
            setResult(pulls);
        } catch (err) {
            console.error(err);
            setResult(`Error loading cat data: ${err}`);
        }
    };
    

    function seedIter(x: number) {
        // Ensure x is treated as a 32-bit unsigned integer
        x = x >>> 0;
    
        let b = (x << 13) >>> 0;
        let c = x ^ b;
        let d = c >>> 17;
        let e = c ^ d;
        let f = (e << 15) >>> 0;
        let g = e ^ f;
    
        return g >>> 0; // Return as 32-bit unsigned integer
    }
    


	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
				<div className="flex flex-col gap-[32px] items-center justify-left">
					<div className="flex gap-[32px]">
						<label htmlFor="seedID">Seed:</label>
						<input
							id="seedID"
							type="text"
							value={seedID}
							onChange={(e) => setSeedID(e.target.value)}
							className="border p-2 rounded"
						/>
					</div>
					<div className="flex gap-[32px]">
						<label htmlFor="eventID">Event ID:</label>
						<input
							id="eventID"
							type="text"
							value={eventID}
							onChange={(e) => setEventID(e.target.value)}
							className="border p-2 rounded"
						/>
					</div>
					<button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded">
						Search
					</button>
					{/* Toggle checkboxes */}
                    <div className="flex gap-6 mb-4">
                        <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={showA}
                            onChange={() => setShowA(!showA)}
                            className="mr-2"
                        />
                        Show Column A
                        </label>
                        <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={showB}
                            onChange={() => setShowB(!showB)}
                            className="mr-2"
                        />
                        Show Column B
                        </label>
                    </div>

                    {Array.isArray(result) && (
                        <table className="w-full border-collapse border">
                        <thead>
                            <tr>
                            {showA && <th className="border px-2 py-1">No.</th>}
                            {showA && <th className="border px-2 py-1">Result</th>}
                            {showB && <th className="border px-2 py-1">Alt No.</th>}
                            {showB && <th className="border px-2 py-1">Alt Result</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: Math.ceil(result.length / 2) }).map((_, rowIndex) => {
                            const idxA = rowIndex * 2;
                            const idxB = rowIndex * 2 + 1;
                            const pullA = result[idxA];
                            const pullB = result[idxB];
                            const rowNum = rowIndex + 1;

                            return (
                                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                {showA && (
                                    <>
                                    <td className="border px-2 py-1 align-top whitespace-pre-wrap">
                                    {pullA
                                        ? `${rowNum}A`
                                        : '-'}
                                    </td>
                                    <td className="border px-2 py-1 align-top whitespace-pre-wrap">
                                    {pullA
                                        ? `${pullA.description}`
                                        : '-'}
                                    </td>
                                    </>
                                )}
                                {showB && (
                                    <>
                                    <td className="border px-2 py-1 align-top whitespace-pre-wrap">
                                    {pullB
                                        ? `${rowNum}B`
                                        : '-'}
                                    </td>
                                    <td className="border px-2 py-1 align-top whitespace-pre-wrap">
                                    {pullB
                                        ? `${pullB.description}`
                                        : '-'}
                                    </td>
                                    </>
                                )}
                                </tr>
                            );
                            })}
                        </tbody>
                        </table>
                    )}
                    {typeof result === 'string' && (
                        <p className="text-red-600 mt-4">{result}</p>
                    )}
				</div>
			</main>
			<footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
				BCEN Gacha
			</footer>
		</div>
	);
}
