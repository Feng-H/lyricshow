'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { SongList } from '@/components/song/SongList';
import { SearchBar } from '@/components/search/SearchBar';
import { loadSongs, searchSongs } from '@/lib/data';
import { Song } from '@/lib/types';
import { Loading } from '@/components/ui/Loading';

export default function HomePage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('search') || '';

  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const allSongs = await loadSongs();
        setSongs(allSongs);

        if (initialQuery) {
          const results = await searchSongs(initialQuery);
          setFilteredSongs(results);
        } else {
          setFilteredSongs(allSongs);
        }
      } catch (error) {
        console.error('Failed to load songs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [initialQuery]);

  const handleSearch = useMemo(() => {
    return async (query: string) => {
      setSearchQuery(query);
      setLoading(true);

      try {
        if (query.trim()) {
          const results = await searchSongs(query);
          setFilteredSongs(results);
        } else {
          setFilteredSongs(songs);
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };
  }, [songs]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <section className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            双语赞美诗
            <span className="block text-lg md:text-xl text-muted-foreground font-normal mt-2">
              Bilingual Praise Songs
            </span>
          </h1>
          <p className="text-muted-foreground">
            共 {songs.length} 首赞美诗 | {songs.length} praise songs
          </p>
        </section>

        <section className="space-y-4">
          <SearchBar
            onSearch={handleSearch}
            placeholder="搜索歌名、歌词或输入编号..."
            initialValue={searchQuery}
          />
          {searchQuery && (
            <p className="text-sm text-muted-foreground">
              找到 {filteredSongs.length} 首相关歌曲 | Found {filteredSongs.length} songs
            </p>
          )}
        </section>

        <section>
          {loading ? (
            <Loading />
          ) : (
            <SongList songs={filteredSongs} />
          )}
        </section>

        {!loading && filteredSongs.length === 0 && (
          <section className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? '未找到相关歌曲，请尝试其他关键词' : '暂无歌曲数据'}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}