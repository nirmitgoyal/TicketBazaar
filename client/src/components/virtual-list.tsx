import { useMemo, useState, useEffect, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
}

/**
 * High-performance virtual list component for large datasets
 */
export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className,
  overscan = 5,
  onScroll,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleRange = useMemo(() => {
    const containerHeight = height;
    const totalHeight = items.length * itemHeight;
    
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return {
      startIndex,
      endIndex,
      totalHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items.length, itemHeight, scrollTop, height, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  };

  return (
    <div
      ref={containerRef}
      className={cn("overflow-auto", className)}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: visibleRange.totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${visibleRange.offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={visibleRange.startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleRange.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface VirtualGridProps<T> {
  items: T[];
  width: number;
  height: number;
  itemWidth: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  gap?: number;
}

/**
 * Virtual grid component for grid layouts
 */
export function VirtualGrid<T>({
  items,
  width,
  height,
  itemWidth,
  itemHeight,
  renderItem,
  className,
  gap = 0,
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const columnsCount = Math.floor(width / (itemWidth + gap));
  const rowsCount = Math.ceil(items.length / columnsCount);
  const totalHeight = rowsCount * (itemHeight + gap);

  const visibleRange = useMemo(() => {
    const startRow = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - 1);
    const endRow = Math.min(
      rowsCount - 1,
      Math.floor((scrollTop + height) / (itemHeight + gap)) + 1
    );

    return {
      startRow,
      endRow,
      startIndex: startRow * columnsCount,
      endIndex: Math.min(items.length - 1, (endRow + 1) * columnsCount - 1),
    };
  }, [scrollTop, height, itemHeight, gap, rowsCount, columnsCount, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      className={cn("overflow-auto", className)}
      style={{ width, height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${visibleRange.startRow * (itemHeight + gap)}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.startIndex + index;
            const row = Math.floor(actualIndex / columnsCount);
            const col = actualIndex % columnsCount;
            
            return (
              <div
                key={actualIndex}
                style={{
                  position: 'absolute',
                  width: itemWidth,
                  height: itemHeight,
                  left: col * (itemWidth + gap),
                  top: (row - visibleRange.startRow) * (itemHeight + gap),
                }}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}