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
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            isActiveRange(start, end)
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
          }`}
        >
          {start}-{end}
        </button>
      ))}
    </div>
  );
}