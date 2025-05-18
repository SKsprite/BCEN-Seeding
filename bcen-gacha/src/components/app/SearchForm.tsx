// components/app/SearchForm.tsx
'use client';
import React, { useState } from 'react';
import { EventSelector } from './EventSelector';

interface Props {
    seed: string;
    onSeedChange: (v: string) => void;
    eventKeys: string;              // comma-joined list
    onEventKeysChange: (v: string) => void;
    onSearch: () => void;
}

export const SearchForm: React.FC<Props> = ({
    seed, onSeedChange,
    eventKeys, onEventKeysChange,
    onSearch,
}) => {
    const [modalOpen, setModalOpen] = useState(false);

    // keep a temp array in the modal until user hits Done
    const [tempKeys, setTempKeys] = useState<string[]>(
        eventKeys.split(',').map(s => s.trim()).filter(Boolean)
    );

    const openModal = () => {
        setTempKeys(eventKeys.split(',').map(s => s.trim()).filter(Boolean));
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const commitSelection = () => {
        onEventKeysChange(tempKeys.join(','));
        closeModal();
    };

    return (
        <div className="flex flex-col gap-4">
        <div className="flex gap-4">
            <label>Seed:</label>
            <input
            value={seed}
            onChange={e => onSeedChange(e.target.value)}
            className="border p-1 rounded"
            />
        </div>

        <div className="flex gap-4 items-center">
            <label>Events:</label>
            <input
            type="text"
            value={eventKeys}
            readOnly
            onClick={openModal}
            placeholder="Click to select…"
            className="border p-1 rounded cursor-pointer bg-white"
            />
        </div>

        <button
            onClick={onSearch}
            className="bg-blue-500 text-white px-3 py-1 rounded self-start"
        >
            Search
        </button>

        {/*
            Modal overlay
        */}
        {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            {/* note: p-4 gives you a little “breathing room” on small screens */}
            <div
            className="
                bg-white  
                rounded-lg  
                shadow-xl  
                p-6  
                w-full  
                max-w-3xl        /* or max-w-full if you truly want fullscreen */
                h-[80vh]          /* use vh instead of % for more predictable behavior */
                flex  
                flex-col  
                overflow-hidden
            "
            >
            <h3 className="text-lg font-semibold mb-4 flex-none">
                Select Events
            </h3>

            <div className="flex-1 overflow-auto">
                <EventSelector
                value={tempKeys}
                onChange={setTempKeys}
                />
            </div>

            <div className="mt-4 flex-none flex justify-end gap-2">
                <button
                onClick={closeModal}
                className="px-3 py-1 rounded border"
                >
                Cancel
                </button>
                <button
                onClick={commitSelection}
                className="px-3 py-1 rounded bg-blue-500 text-white"
                >
                Done
                </button>
            </div>
            </div>
        </div>
        )}
        </div>
    );
};
