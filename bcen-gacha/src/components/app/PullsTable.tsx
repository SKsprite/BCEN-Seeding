// components/app/PullsTable.tsx
import React from 'react';
import { PullResult } from '@/lib/gacha';

export type Pull = { description: string; seed: number };
export type BannerResults = {
    EventName: string;
    A?: PullResult[];
    B?: PullResult[];
};
export type BannerSettings = {
    showTable: boolean;
    showA: boolean;
    showB: boolean;
};

interface Props {
    pulls: BannerResults;
    settings: BannerSettings;
}


export const PullsTable: React.FC<{
    pulls: BannerResults;
    settings: BannerSettings;
}> = ({ pulls, settings }) => {
    const { showTable, showA, showB } = settings;
    const { EventName, A = [], B = [] } = pulls;

    if (!showTable) return null;

    const rowCount = Math.max(A.length, B.length);

    return (
        <div className="mb-8 border rounded overflow-hidden">
            <div className="bg-gray-200 p-2 font-semibold">
            {EventName}
            </div>
            <table className="w-full border-collapse">
            <thead>
                <tr>
                {showA && <th className="border px-2 py-1">No.</th>}
                {showA && <th className="border px-2 py-1">Result A</th>}
                {showB && <th className="border px-2 py-1">No.</th>}
                {showB && <th className="border px-2 py-1">Result B</th>}
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: rowCount }).map((_, i) => (
                <tr key={i} className={i%2===0 ? 'bg-white' : 'bg-gray-50'}>
                    {showA && <>
                    <td className="border px-2 py-1">{A[i] ? `${i+1}A` : '-'}</td>
                    <td className="border px-2 py-1">{A[i] ? `#${A[i].id} ${A[i].name} (${A[i].rarity})` : '-'}</td>
                    </>}
                    {showB && <>
                    <td className="border px-2 py-1">{B[i] ? `${i+1}B` : '-'}</td>
                    <td className="border px-2 py-1">{B[i] ? `#${B[i].id} ${B[i].name} (${B[i].rarity})` : '-'}</td>
                    </>}
                </tr>
                ))}
            </tbody>
            </table>
        </div>
    );
};
