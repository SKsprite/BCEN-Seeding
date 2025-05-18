// components/app/CombinedTable.tsx
import React, { useRef } from 'react';
import type { BannerResults, BannerSettings } from './PullsTable';
import { useDragToScroll } from '@/hooks/useDragScroll';

import {
    DndContext,
    DragEndEvent,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    horizontalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const rarityClasses: Record<string,string> = {
    legend: 'bg-gradient-to-r from-yellow-400 to-blue-500 text-white',
    uber:   'bg-blue-500 text-white',
    super:  'bg-yellow-300 text-black',
    rare:   'bg-orange-400 text-white',
};

function getRarityClass(desc?: string): string {
    if (!desc) return '';
    const d = desc.toLowerCase();
    if (d.includes('legend')) return rarityClasses.legend;
    if (d.includes('uber'))   return rarityClasses.uber;
    if (d.includes('super'))  return rarityClasses.super;
    if (d.includes('rare'))   return rarityClasses.rare;
    return '';
}

// A single <th> that can be dragged to reorder banners
function SortableBannerHeader({
    id,
    colSpan,
    children
}: {
    id: string;
    colSpan: number;
    children: React.ReactNode;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
} = useSortable({ id });
    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
        cursor: 'move',
        opacity: isDragging ? 0.7 : 1
    };
    
    return (
        <th
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            data-draggable                 // mark it so our scroll-hook can ignore it
            colSpan={colSpan}
            style={style}
            className="border px-2 py-1 text-center select-none"
        >
            {children}
        </th>
    );
}

interface Props {
    results: Record<string, BannerResults>;
    settings: Record<string, BannerSettings>;
    bannerOrder: string[];
    onOrderChange: (newOrder: string[]) => void;
    onToggle: (key: string, field: keyof BannerSettings) => void;
}

export const CombinedTable: React.FC<Props> = ({
    results,
    settings,
    bannerOrder,
    onOrderChange,
    onToggle,
}) => {
  // this ref is exactly the shape our hook wants:
    const containerRef = useDragToScroll();
    const activeBanners = bannerOrder.filter(key => settings[key]?.showTable);

  // how many rows?
    const rowCount = Math.max(
        ...activeBanners.flatMap(k => {
        const r = results[k];
        return [
            settings[k].showA ? r.A?.length ?? 0 : 0,
            settings[k].showB ? r.B?.length ?? 0 : 0,
        ];
        })
    );

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
    const handleDragEnd = (e: DragEndEvent) => {
        const { active, over } = e;
        if (!over || active.id === over.id) return;
        const oldIdx = bannerOrder.indexOf(active.id as string);
        const newIdx = bannerOrder.indexOf(over.id as string);
        const newOrder = arrayMove(bannerOrder, oldIdx, newIdx);
        onOrderChange(newOrder);
    };


  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
    <div
        ref={containerRef}
        className="overflow-x-auto whitespace-nowrap border select-none"
        style={{ cursor: 'grab' }} // initial cursor
    >
        <table className="min-w-max border-collapse table-auto">
            <thead>
            {/* Banner headers */}
            <SortableContext
              items={activeBanners}
              strategy={horizontalListSortingStrategy}
            >
            <tr className="bg-gray-200">
                {activeBanners.map(key => {
                    const span = (settings[key].showA ? 2 : 0) + (settings[key].showB ? 2 : 0);
                    return (
                      <SortableBannerHeader
                        key={key}
                        id={key}
                        colSpan={span}
                      >
                        {results[key].EventName}
                      </SortableBannerHeader>
                    );
                })}
            </tr>
            </SortableContext>
            {/* Column labels */}
            <tr>
                {activeBanners.map(key => (
                    <React.Fragment key={key}>
                    {settings[key].showA && (
                        <>
                        <th className="border px-2 py-1">No.</th>
                        <th className="border px-2 py-1">Result A</th>
                    </>
                    )}
                    {settings[key].showB && (
                        <>
                        <th className="border px-2 py-1">No.</th>
                        <th className="border px-2 py-1">Result B</th>
                    </>
                    )}
                </React.Fragment>
                ))}
            </tr>
            </thead>
            <tbody>
            {Array.from({ length: rowCount }).map((_, row) => (
                <tr key={row}>
                {activeBanners.map(key => {
                    const { A, B } = results[key];
                    const s = settings[key];
            
                    // grab the raw items
                    const itemA = A?.[row];
                    const itemB = B?.[row];
            
                    return (
                        <React.Fragment key={key}>
                        {s.showA && (
                            <>
                            <td className="border px-2 py-1 text-center">
                                {itemA ? `${row + 1}A #${itemA.id}` : '-'}
                            </td>
                            <td className={`border px-2 py-1 ${getRarityClass(itemA?.rarity)}`}>
                                {itemA
                                ? `${itemA.name} (${itemA.rarity})`
                                : '-'}
                            </td>
                            </>
                        )}
                        {s.showB && (
                            <>
                            <td className="border px-2 py-1 text-center">
                                {itemB ? `${row + 1}B #${itemB.id}` : '-'}
                            </td>
                            <td className={`border px-2 py-1 ${getRarityClass(itemB?.rarity)}`}>
                                {itemB
                                ? `${itemB.name} (${itemB.rarity})`
                                : '-'}
                            </td>
                            </>
                        )}
                        </React.Fragment>
                    );
                    })}
                </tr>
            ))}
            </tbody>
        </table>
        </div>
        </DndContext>
    );
};
