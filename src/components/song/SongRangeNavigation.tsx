import { useMemo } from 'react';

interface SongRangeNavigationProps {
  totalSongs: number;
  onRangeSelect: (startId: number, endId: number) => void;
  currentStartId?: number;
  currentEndId?: number;
}

export function SongRangeNavigation({
  totalSongs,
  onRangeSelect,
  currentStartId,
  currentEndId
}: SongRangeNavigationProps) {
  const ranges = useMemo(() => {
    const rangeSize = 50;
    const result = [];

    for (let i = 0; i < totalSongs; i += rangeSize) {
      const start = i + 1;
      const end = Math.min(i + rangeSize, totalSongs);
      result.push({ start, end });
    }

    return result;
  }, [totalSongs]);

  const isActiveRange = (start: number, end: number) => {
    return currentStartId === start && currentEndId === end;
  };

  const scrollToSong = (songId: number) => {
    const element = document.querySelector(`[data-song-id="${songId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleRangeClick = (start: number, end: number) => {
    onRangeSelect(start, end);
    // Scroll to the first song in the range after a brief delay to allow for re-render
    setTimeout(() => scrollToSong(start), 100);
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {ranges.map(({ start, end }) => (
        <button
          key={`${start}-${end}`}
          onClick={() => handleRangeClick(start, end)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all transform hover:scale-105 shadow-sm hover:shadow-md ${
            isActiveRange(start, end)
              ? 'bg-primary text-primary-foreground ring-2 ring-primary/50 ring-offset-2'
              : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground hover:ring-1 hover:ring-border/50'
          }`}
        >
          {start}-{end}
        </button>
      ))}
    </div>
  );
}