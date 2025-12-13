import Link from 'next/link';
import { Song } from '@/lib/types';

interface SongDirectoryProps {
  songs: Song[];
}

export function SongDirectory({ songs }: SongDirectoryProps) {
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-1 gap-1">
        {songs.map((song) => (
          <SongDirectoryItem key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
}

function SongDirectoryItem({ song }: { song: Song }) {
  // Split bilingual title into Chinese and English parts
  // Format: "中文标题 English Title"
  const titleMatch = song.title.match(/^([\u4e00-\u9fff\s]+?)\s+([a-zA-Z\s]+)$/);

  let cnTitle = song.title;
  let enTitle = '';

  if (titleMatch) {
    cnTitle = titleMatch[1].trim();
    enTitle = titleMatch[2].trim();
  } else {
    // If no clear separation, try to find the first English word
    const words = song.title.split(' ');
    const firstEnglishIndex = words.findIndex(word => /[a-zA-Z]/.test(word));

    if (firstEnglishIndex > 0) {
      cnTitle = words.slice(0, firstEnglishIndex).join(' ');
      enTitle = words.slice(firstEnglishIndex).join(' ');
    }
  }

  return (
    <Link
      href={`/song/${song.id}`}
      className="block hover:bg-muted/50 transition-colors py-2 px-3 rounded border border-transparent hover:border-border"
    >
      <div className="flex items-center gap-3">
        {/* Song Number */}
        <span className="text-sm font-mono text-muted-foreground min-w-[2.5rem] text-center">
          #{song.id}
        </span>

        {/* Chinese Title */}
        <div className="flex-1 font-chinese">
          <span className="text-foreground font-medium">{cnTitle}</span>
        </div>

        {/* Separator */}
        <span className="text-muted-foreground">|</span>

        {/* English Title */}
        <div className="flex-1">
          <span className="text-foreground">{enTitle}</span>
        </div>
      </div>
    </Link>
  );
}