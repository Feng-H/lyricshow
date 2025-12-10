import Link from 'next/link';
import { Song } from '@/lib/types';

interface SongListProps {
  songs: Song[];
}

export function SongList({ songs }: SongListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {songs.map((song) => (
        <SongCard key={song.id} song={song} />
      ))}
    </div>
  );
}

function SongCard({ song }: { song: Song }) {
  return (
    <Link href={`/song/${song.id}`} className="block">
      <div className="song-card group">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
            #{song.id}
          </span>
        </div>

        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {song.title}
        </h3>

        <div className="space-y-2 text-sm text-muted-foreground">
          {song.cn_lines[0] && (
            <p className="line-clamp-1 font-chinese">
              {song.cn_lines[0]}
            </p>
          )}
          {song.en_lines[0] && (
            <p className="line-clamp-1">
              {song.en_lines[0]}
            </p>
          )}
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          {song.cn_lines.length} 行中文 | {song.en_lines.length} lines English
        </div>
      </div>
    </Link>
  );
}