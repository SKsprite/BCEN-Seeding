// components/app/BannerControls.tsx
import React from 'react';

export type BannerSettings = {
    showTable: boolean;
    showA: boolean;
    showB: boolean;
};

interface Props {
    eventName: string;
    settings?: BannerSettings;      // <-- optional
    onToggle: (field: keyof BannerSettings) => void;
}

export const BannerControls: React.FC<Props> = ({
    eventName, settings, onToggle
}) => {
    const { showTable = true, showA = true, showB = true } = settings || {};
    return (
        <div className="flex items-center gap-4 mb-2">
            <span className="font-semibold">{eventName}</span>
            <label className="inline-flex items-center">
            <input
                type="checkbox"
                checked={showTable}
                onChange={() => onToggle('showTable')}
                className="mr-1"
            />
            Show
            </label>
            <label className="inline-flex items-center">
            <input
                type="checkbox"
                checked={showA}
                onChange={() => onToggle('showA')}
                className="mr-1"
            />
            Col A
            </label>
            <label className="inline-flex items-center">
            <input
                type="checkbox"
                checked={showB}
                onChange={() => onToggle('showB')}
                className="mr-1"
            />
            Col B
            </label>
        </div>
    );
}
