// components/app/EventSelector.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { getEvents } from '@/utils/loadYaml';
import { useDebounce } from '@/hooks/useDebounce';

type EventData = {
    name: string;
    // ...other event fields if you need them
};

interface Props {
    /** List of selected keys */
    value: string[];
    /** Call whenever selection changes */
    onChange: (v: string[]) => void;
}

export const EventSelector: React.FC<Props> = ({ value, onChange }) => {
    const [eventsMap, setEventsMap] = useState<Record<string, EventData>>({});
    const [filter, setFilter]       = useState('');
    const debouncedFilter       = useDebounce(filter, 250);

    // Load events once
    useEffect(() => {
        getEvents().then(evts => setEventsMap(evts));
    }, []);

    const options = Object.keys(eventsMap);

    const toggle = (k: string) => {
        if (value.includes(k)) onChange(value.filter(x => x !== k));
        else                  onChange([...value, k]);
    };

    // Split on commas for OR-logic, trim out any empty strings
    // …but use debouncedFilter so we only re-filter once they've stopped typing
    const terms = debouncedFilter
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

    const filtered = terms.length === 0
        ? options
        : options.filter(key => {
            const haystack = `${key} ${eventsMap[key]?.name ?? ''}`;
            return terms.some(term => {
            // Try regex first
            try {
                const re = new RegExp(term, 'i');
                return re.test(haystack);
            } catch {
                // Fallback to case-insensitive substring
                return haystack.toLowerCase().includes(term.toLowerCase());
            }
            });
        });

        return (
            <div className="border p-2 rounded flex flex-col w-full h-full">
            {/* filter input */}
            <input
                type="text"
                placeholder="Filter (comma=OR, regex OK)"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="mb-2 p-1 border rounded w-full"
            />

            {/* scrollable list */}
            <div className="flex-1 overflow-auto">
                {filtered.map(key => (
                <label key={key} className="flex items-center mb-1">
                    <input
                    type="checkbox"
                    checked={value.includes(key)}
                    onChange={() => toggle(key)}
                    className="mr-2"
                    />
                    <span className="font-mono mr-1">{key}</span>
                    <span className="text-sm">{eventsMap[key]?.name}</span>
                </label>
                ))}

                {filtered.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                    No events match “{filter}”
                </p>
                )}
            </div>
        </div>
    );
};
