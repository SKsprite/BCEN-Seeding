// types/bcEn.ts
export interface CatStat {
    health: number;
    knockbacks: number;
    speed: number;
    cost: number;
    production_cooldown: number;
    attack_cooldown: number;
    range: number;
    width: number;
    damage_0: number;
    attack_time_0: number;
    attack_duration: number;
    // ...other potential properties
}

export interface CatEntry {
    name: string[];
    desc: string[];
    stat: CatStat[];
    rarity: number;
    max_level: number;
    growth: number[];
}

export interface GachaBanner {
    cats: number[];
    series_id: number;
    name: string;
    rate: string;
    similarity: number;
}

export interface EventData {
    start_on: string;
    end_on: string;
    version: string;
    name: string;
    id: number;
    rare: number;
    supa: number;
    uber: number;
    legend: number;
    // optional flags
    guaranteed?: boolean;
    platinum?: string;
    step_up?: boolean;
}

export interface BCEnSchema {
    cats: Record<string, CatEntry>;
    gacha: Record<string, GachaBanner>;
    events: Record<string, EventData>;
}
