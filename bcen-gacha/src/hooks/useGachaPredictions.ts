// hooks/useGachaPredictions.ts
import { useState } from 'react';
import type { BannerResults } from '@/components/app/PullsTable';

export function useGachaPredictions() {
    const [results, setResults] = useState<Record<string, BannerResults>>({});

    async function fetchBanner(eventKey: string, seed: number) {
        const res = await fetch(`/api/gacha?eventKey=${eventKey}&seed=${seed}&count=100`);
        const json = await res.json();
        // map into BannerResults shape…
        const banner: BannerResults = {
        EventName: json.results.EventName,
        A: json.results.A,//.map((u: any) => ({ description: `#${u.id} ${u.name} (${u.rarity})`, seed: u.seed })),
        B: json.results.B,//.map((u: any) => ({ description: `#${u.id} ${u.name} (${u.rarity})`, seed: u.seed }))
        };
        setResults(r => ({ ...r, [eventKey]: banner }));
    }

    return { results, fetchBanner };
}
