import { useState, useMemo } from 'react';

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
  const [isOpen, setIsOpen] = useState(false);

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
    // Close sidebar after selection
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-50 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        title="快速导航 | Quick Navigation"
      >
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          快速导航
        </span>
      </button>

      {/* Side Panel */}
      <div
        className={`fixed left-0 top-0 h-full bg-background/98 backdrop-blur-md border-r shadow-2xl z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full overflow-y-auto">
          <div className="p-6 w-72">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <h3 className="text-lg font-semibold text-foreground">
                  快速导航
                </h3>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Song Info */}
            <div className="mb-6 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                共 <span className="font-semibold text-foreground">{totalSongs}</span> 首歌曲
              </p>
            </div>

            {/* Range Buttons */}
            <div className="space-y-2">
              {ranges.map(({ start, end }) => (
                <button
                  key={`${start}-${end}`}
                  onClick={() => handleRangeClick(start, end)}
                  className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:translate-x-1 ${
                    isActiveRange(start, end)
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary/50 ring-offset-2'
                      : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground hover:ring-1 hover:ring-border/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{start}-{end}</span>
                    <span className="text-xs opacity-70">首</span>
                  </div>
                  {isActiveRange(start, end) && (
                    <div className="text-xs mt-1 opacity-90">当前范围</div>
                  )}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t text-xs text-muted-foreground">
              <p>点击范围快速跳转到对应歌曲</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}