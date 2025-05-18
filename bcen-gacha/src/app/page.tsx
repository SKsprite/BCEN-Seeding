'use client';
import React, { useState, useEffect } from 'react';
import { SearchForm }          from '@/components/app/SearchForm';
import { PullsTable }          from '@/components/app/PullsTable';
import { CombinedTable }       from '@/components/app/CombinedTable';
import { useGachaPredictions } from '@/hooks/useGachaPredictions';
import type { BannerSettings } from '@/components/app/BannerControls';

type LayoutPreset = 'separate' | 'combined';

export default function Home() {
    const [seed, setSeed]           = useState('');
    const [eventKeys, setEventKeys] = useState('');
    const { results, fetchBanner }  = useGachaPredictions();
    const [settings, setSettings]   = useState<Record<string,BannerSettings>>({});
    const [preset, setPreset]       = useState<LayoutPreset>('separate');
    const [bannerOrder, setBannerOrder] = useState<string[]>([]);

    const isMap = results !== null && typeof results !== 'string';
    const bannerKeys = isMap ? bannerOrder : [];
    const allShowTable = bannerKeys.length > 0 && bannerKeys.every(k => settings[k]?.showTable);
    const allShowA     = bannerKeys.length > 0 && bannerKeys.every(k => settings[k]?.showA);
    const allShowB     = bannerKeys.length > 0 && bannerKeys.every(k => settings[k]?.showB);

    function toggleAll(field: keyof BannerSettings) {
        setSettings(prev => {
            const keys = Object.keys(prev);
            const currentlyAll = keys.every(k => prev[k][field]);
            const next = { ...prev };
        
            for (const k of keys) {
                const newValue = !currentlyAll;
                next[k] = { ...prev[k], [field]: newValue };
        
                if (field === 'showTable') {
                    next[k].showA = newValue;
                    next[k].showB = newValue;
                } else {
                    if (newValue) {
                        next[k].showTable = true;
                    }
                    if (!next[k].showA && !next[k].showB) {
                        next[k].showTable = false;
                    }
                }
            }
        
            return next;
        });
    }

    useEffect(() => {
        const stored = localStorage.getItem('layoutPreset') as LayoutPreset | null;
        if (stored === 'combined' || stored === 'separate') {
            setPreset(stored);
        }
    }, []);

    // initialize defaults any time we get new banners
    useEffect(() => {
        if (!isMap) return;

        if (results && typeof results !== 'string') {
            setBannerOrder(Object.keys(results));
        }

        const next = {} as Record<string,BannerSettings>;
        for (const key of Object.keys(results!)) {
            next[key] = settings[key] ?? {
                showTable: true,
                showA:      true,
                showB:      true
            };
        }
        setSettings(next);
    }, [results]);

    // persist layout choice
    useEffect(() => {
        localStorage.setItem('layoutPreset', preset);
    }, [preset]);

    async function onSearch() {
        const keys = eventKeys.split(',').map(s => s.trim()).filter(Boolean);
        for (const k of keys) {
        await fetchBanner(k, Number(seed));
        }
    }

    function toggle(key: string, field: keyof BannerSettings) {
        setSettings(prev => {
            const current = prev[key];
            const newValue = !current[field];
        
            // start with flipping that one field
            let updated: BannerSettings = { ...current, [field]: newValue };
        
            if (field === 'showTable') {
                // turning table on/off also flips both columns
                updated.showA = newValue;
                updated.showB = newValue;
            } else {
                // if you turn ON either column, ensure table is shown
                if (newValue) {
                updated.showTable = true;
                }
                // if both columns end up OFF, hide the table
                if (!updated.showA && !updated.showB) {
                updated.showTable = false;
                }
            }
        
            return { ...prev, [key]: updated };
        });
    }

    return (
        <div className="p-8 space-y-6">
        {/* layout switch */}
        {isMap && (
            <div className="flex items-center gap-4">
            <label className="font-medium">Layout:</label>
            <select
                className="border px-2 py-1 rounded"
                value={preset}
                onChange={e => setPreset(e.target.value as LayoutPreset)}
            >
                <option value="separate">Separate tables</option>
                <option value="combined">One combined table</option>
            </select>
            </div>
        )}

        {/* search form */}
        <SearchForm
            seed={seed}
            onSeedChange={setSeed}
            eventKeys={eventKeys}
            onEventKeysChange={setEventKeys}
            onSearch={onSearch}
        />

        {/* Master Banner */}
        {isMap && Object.entries(results).length > 1 && (
            <div className="flex items-center gap-6 mb-4">
                <label className="inline-flex items-center gap-1">
                <input
                    type="checkbox"
                    checked={allShowTable}
                    onChange={() => toggleAll('showTable')}
                />
                Show All Tables
                </label>
                <label className="inline-flex items-center gap-1">
                <input
                    type="checkbox"
                    checked={allShowA}
                    onChange={() => toggleAll('showA')}
                />
                Show All A
                </label>
                <label className="inline-flex items-center gap-1">
                <input
                    type="checkbox"
                    checked={allShowB}
                    onChange={() => toggleAll('showB')}
                />
                Show All B
                </label>
            </div>
            )}

        {/* per‐banner toggle controls */}
        {isMap && (
            <div className="grid gap-2">
            {bannerOrder.map((key: any) => {
                const banner = results![key];
                const s = settings[key] ?? {
                    showTable: true,
                    showA:      true,
                    showB:      true,
                };
                return (
                <div key={key} className="flex items-center gap-4">
                    <label className="inline-flex items-center gap-1">
                    <input
                        type="checkbox"
                        checked={s.showTable}
                        onChange={() => toggle(key,'showTable')}
                    />
                    Show
                    </label>
                    <label className="inline-flex items-center gap-1">
                    <input
                        type="checkbox"
                        checked={s.showA}
                        onChange={() => toggle(key,'showA')}
                    />
                    A
                    </label>
                    <label className="inline-flex items-center gap-1">
                    <input
                        type="checkbox"
                        checked={s.showB}
                        onChange={() => toggle(key,'showB')}
                    />
                    B
                    </label>
                    <span className="font-medium">{banner.EventName}</span>
                </div>
                );
            })}
            </div>
        )}

        {/* now render your tables */}
        {isMap && preset === 'separate' && (
            <div className="flex gap-4 overflow-x-auto px-2">
            {bannerOrder.map(key => {
                const banner = results![key];
                const s = settings[key]!;
                if (!s.showTable) return null;
                return (
                <div key={key} className="flex-none w-[30%]">
                    <PullsTable pulls={banner} settings={s} />
                </div>
                );
            })}
            </div>
        )}

        {isMap && preset === 'combined' && (
            <CombinedTable
                results={results}
                settings={settings}
                bannerOrder={bannerOrder}
                onOrderChange={setBannerOrder}
                onToggle={toggle}
            />
        )}
        </div>
    );
}
