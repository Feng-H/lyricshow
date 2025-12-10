import { Song } from '@/lib/types';
import { cn } from '@/lib/utils';

interface BilingualLyricsProps {
  song: Song;
  language: 'cn' | 'en';
}

export function BilingualLyrics({ song, language }: BilingualLyricsProps) {
  const currentLines = language === 'cn' ? song.cn_lines : song.en_lines;
  const isSectionMarker = (line: string) => {
    const markers = ['副歌', 'Chorus', '前副歌', 'Pre-Chorus', '桥段', 'Bridge', '主歌', 'Verse'];
    return markers.some(marker => line.toLowerCase().includes(marker.toLowerCase()));
  };

  return (
    <div className="bg-card rounded-lg p-6 md:p-8 shadow-sm border">
      <div className="space-y-4">
        {currentLines.map((line, index) => {
          if (isSectionMarker(line)) {
            return (
              <div
                key={index}
                className="text-primary font-semibold text-sm uppercase tracking-wider mt-6 first:mt-0"
              >
                {line}
              </div>
            );
          }

          if (line.trim() === '') {
            return <div key={index} className="h-4" />;
          }

          return (
            <div
              key={index}
              className={cn(
                "lyric-line text-lg md:text-xl",
                language === 'cn' ? 'font-chinese' : 'font-sans'
              )}
            >
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
}