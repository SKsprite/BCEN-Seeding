// lib/gacha.ts
import seedrandom from 'seedrandom';
import { loadBCEn }   from '@/utils/newYaml';
import type { BCEnSchema, GachaBanner } from '@/types/bcEn';

// The exact LCG your game uses:
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

// Wrap the LCG into a 0–1 RNG:
class LCG {
    private seed: number;
    constructor(seed: number) {
        // Ensure it's a 32-bit unsigned int
        this.seed = seed >>> 0;
        this.next();
    }
    // returns a float ∈ [0,1)
    next(): number {
        this.seed = seedIter(this.seed);
        // return this.seed / 0x1_0000_0000;
        return this.seed;
    }
    // reset the seed
    setSeed(seed: number) {
        this.seed = seed >>> 0;
    }
    // reset the seed
    getSeed() {
        return this.seed;
    }
}

export interface PullResult {
    seed: number;
    id: number;
    name: string;
    rarity: 'Legend Rare' | 'Uber Rare' | 'Super Rare' | 'Rare';
}

export class Gacha {
    private schema: BCEnSchema;
    private selectedEvent: BCEnSchema['events'][string];
    private cats: BCEnSchema['cats'];
    private currentGacha: GachaBanner;
    private rng: LCG;
    private pityCounter = 0;

    constructor(eventKey: string, seed = 1) {
        // 1. Load the master bc-en.yaml
        this.schema         = loadBCEn();

        // 2. Pick the event by its YAML key
        const evt = this.schema.events[eventKey];
        if (!evt) throw new Error(`Event "${eventKey}" not found in bc-en.yaml`);
        this.selectedEvent  = evt;

        // 3. Find the matching banner by series_id
        const banner = this.schema.gacha[evt.id];
        if (!banner) throw new Error(`No banner found for series_id ${evt.id}`);
        this.currentGacha   = banner;

        // 4. Grab the full cats map and seed the RNG
        this.cats           = this.schema.cats;
        this.rng            = new LCG(seed);
    }

    /** Reset RNG and pity counter */
    public setSeed(seed: number): void {
        this.rng.setSeed(seed);
        this.pityCounter = 0;
    }

    /** Perform one pull */
    public drawOne(): PullResult {
        const legend = this.selectedEvent.legend ?? 0;
        const uber   = this.selectedEvent.uber   ?? 0;
        const supa   = this.selectedEvent.supa   ?? 0;
        const rare   = this.selectedEvent.rare   ?? 0;
        const totalRate = legend + uber + supa + rare;
        const seed = this.rng.next();
        // console.log(seed)
        // a) Optional pity logic (default 300 draws)
        const pityThreshold = (this.selectedEvent as any).pityThreshold ?? 300;
        if (this.pityCounter >= pityThreshold) {
            this.pityCounter = 0;
            // Force an Uber pull
            const uberCats = this.currentGacha.cats.filter(id => this.cats[id].rarity === 3);
            const id = uberCats[Math.floor(seed * uberCats.length)];
            return {seed, id, name: this.cats[id].name[0], rarity: 'Uber Rare' };
        }

        // b) Roll category by event rates
        const roll = Math.abs(seed % totalRate);
        let category: 'legend'|'uber'|'supa'|'rare';
        if (roll < legend)                      category = 'legend';
        else if (roll < legend + uber)          category = 'uber';
        else if (roll < legend + uber + supa)   category = 'supa';
        else                                    category = 'rare';

        // 4) Map category → rarity code
        const rarityMap = { legend: 5, uber: 4, supa: 3, rare: 2 } as const;
        const want = rarityMap[category];

        // c) Filter banner cats by rarity
        const eligible = this.currentGacha.cats.filter(id => this.cats[id].rarity === want);
        if (!eligible.length) {
            throw new Error(`No ${category} cats in banner "${this.currentGacha.name}"`);
        }

        // 6) Pick a cat
        const pickIdx = Math.abs(Math.floor(seed % eligible.length));
        const id = eligible[pickIdx];
        const entry = this.cats[id];

        // e) Update pity: reset on Uber, else increment
        if (category === 'uber') this.pityCounter = 0;
        else                     this.pityCounter++;

        // f) Choose the “maxed” name based on stat array length
        const nameIndex = Math.min(entry.name.length - 1, entry.stat.length - 1);
        const name = entry.name[0];

        return {
        seed,
        id,
        name,
        rarity: category === 'legend'
        ? 'Legend Rare'
        : category === 'uber'
            ? 'Uber Rare'
            : category === 'supa'
                ? 'Super Rare'
                : 'Rare'
        };
    }

    /** Perform n pulls */
    public draw(n = 10): PullResult[] {
        return Array.from({ length: n }, () => this.drawOne());
    }
}
