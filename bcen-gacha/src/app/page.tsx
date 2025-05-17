'use client';

import { useEffect, useState } from 'react';
import { getCats, getEvents, getGacha } from '@/utils/loadYaml'
import { error } from 'console';
import { errorMonitor } from 'events';

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

type Pull = { description: string; seed: number };

// One banner’s results
type BannerResults = {
    EventName: string;
    A?: Pull[];
    B?: Pull[];
};

// A map from event IDs → their pull results
type PullsMap = Record<string, BannerResults>;

type LegendKey = keyof typeof legend;

interface PullsTableProps {
    /** The event ID (shown as a heading above the table) */
    // eventKey: string;
    /** The actual pulls for this banner */
    pulls: BannerResults;
}

const PullsTable: React.FC<PullsTableProps> = ({
    pulls,
}) => {
    const [showBanner, setShowBanner] = useState(true);
    const [showA, setShowA]           = useState(true);
    const [showB, setShowB]           = useState(true);

    const { EventName, A= [], B = [] } = pulls;

    if (!showBanner) {
        return (
        <div className="mb-8 w-full p-4 border rounded bg-gray-100">
            <button
            className="text-blue-600 underline"
            onClick={() => setShowBanner(true)}
            >
            Show banner &quot;{EventName}&quot;
            </button>
        </div>
        );
    }

    if (!A || !B) {
        return (
            <div className="mb-8 w-full p-4 border rounded bg-gray-100">
                {EventName}
            </div>
            );
    }

    // number of rows = max length of A or B
    const rowCount = Math.max(A.length, B.length);
    const colCount = (showA ? 2 : 0) + (showB ? 2 : 0);

    return (
        <div className="mb-8 w-full border rounded overflow-hidden">
            <table className="w-full border-collapse">
                <thead>
                    {/* Banner title row */}
                    <tr className="bg-gray-200">
                        <th colSpan={colCount} className="p-2 text-left">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">Banner:<br/>{EventName}</span>
                                <div className="flex gap-4 items-center">
                                    <label className="inline-flex items-center">
                                        <input
                                        type="checkbox"
                                        checked={showBanner}
                                        onChange={() => setShowBanner(v => !v)}
                                        className="mr-1"
                                        />
                                        Show
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                        type="checkbox"
                                        checked={showA}
                                        onChange={() => setShowA(v => !v)}
                                        className="mr-1"
                                        />
                                        Col A
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                        type="checkbox"
                                        checked={showB}
                                        onChange={() => setShowB(v => !v)}
                                        className="mr-1"
                                        />
                                        Col B
                                    </label>
                                </div>
                            </div>
                        </th>
                        </tr>
                        {/* Column headers */}
                        <tr>
                            {showA && <th className="border px-2 py-1">No.</th>}
                            {showA && <th className="border px-2 py-1">Result A</th>}
                            {showB && <th className="border px-2 py-1">No.</th>}
                            {showB && <th className="border px-2 py-1">Result B</th>}
                        </tr>
                    </thead>
                <tbody>
                {Array.from({ length: rowCount }).map((_, i) => {
                    const pullA = A[i];
                    const pullB = B[i];
                    const rowNum = i + 1;
                    return (
                        <tr
                            key={i}
                            className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        >
                            {showA && (
                            <>
                                <td className="border px-2 py-1">{pullA ? `${rowNum}A` : '-'}</td>
                                <td className="border px-2 py-1">
                                {pullA?.description ?? '-'}
                                </td>
                            </>
                            )}
                            {showB && (
                            <>
                                <td className="border px-2 py-1">{pullB ? `${rowNum}B` : '-'}</td>
                                <td className="border px-2 py-1">
                                {pullB?.description ?? '-'}
                                </td>
                            </>
                            )}
                        </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default function Home() {
	const [seedID, setSeedID] = useState('');
	const [eventID, setEventID] = useState('');
	const [result, setResult] = useState<PullsMap | string | null>(null);

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

    const getPrediction = async (eventKey: string, seedID: number): Promise<BannerResults> => {
        try {
            const res = await fetch(
                `/api/gacha?eventKey=${encodeURIComponent(eventKey)}&seed=${encodeURIComponent(seedID)}&count=100`
            );
            if (!res.ok) throw new Error(`API error ${res.status}`);
            
            const json = await res.json() as {
                results: {
                    EventName: string;
                    A: Array<{ id: number; name: string; rarity: string; seed: number }>;
                    B: Array<{ id: number; name: string; rarity: string; seed: number }>;
                }
            };

            // map the raw API shape into your Pull type
            const A: Pull[] = json.results.A.map(u => ({
                description: `#${u.id} ${u.name} (${u.rarity}) - seed: ${u.seed}`,
                seed: u.seed
            }));
            const B: Pull[] = json.results.B.map(u => ({
                description: `#${u.id} ${u.name} (${u.rarity}) - seed: ${u.seed}`,
                seed: u.seed
            }));
            const EventName = json.results.EventName

            return {EventName, A, B };
        }
        catch (err) {
            console.error(err);

            const errorReturn = { EventName: `Error fetching ${eventKey} banner data: ${err}` };
            return errorReturn;
        }
    }

    const handleSearch = async () => {
        try {
            // Split into an array of event keys
            const eventKeys = eventID.split(",").map(s => s.trim());
            const pulls: PullsMap = {};

            for (const key of eventKeys) {
                // call getPrediction and store its result under this key
                const banner = await getPrediction(key, Number(seedID));
                if (!banner.B) {
                    console.error(`${banner.EventName}`);
                    continue;
                }
                pulls[key] = banner;
            }

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
    

    const isMap = result && typeof result !== 'string';
    const bannerCount = isMap ? Object.keys(result).length : 0;



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

                    {/* inputs & button etc */}
                    {typeof result === 'string' && (
                        <p className="text-red-600 mt-4">{result}</p>
                    )}

                    {isMap && (
                        <div
                            className="
                            flex flex-nowrap gap-4
                            overflow-x-auto overflow-y-hidden
                            px-2
                            "
                        >
                            {Object.entries(result as PullsMap).map(
                                ([eventKey, pulls]) => {
                                    // pick the width class:
                                    const wClass =
                                    bannerCount === 1
                                        ? 'w-full'
                                        : bannerCount === 2
                                        ? 'w-[48%]'
                                        : 'w-[30%]';

                                    return (
                                    <div
                                        key={eventKey}
                                        className={`flex-none ${wClass}`}
                                    >
                                        <PullsTable
                                        pulls={pulls}
                                        />
                                    </div>
                                    );
                                }
                            )}
                        </div>
                    )}
					
				</div>
			</main>
			<footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
				BCEN Gacha
			</footer>
		</div>
	);
}
