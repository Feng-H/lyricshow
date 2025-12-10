'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BilingualLyrics } from '@/components/lyrics/BilingualLyrics';
import { SongActions } from '@/components/lyrics/SongActions';
import { getSongById } from '@/lib/data';
import { Song } from '@/lib/types';
import { Loading } from '@/components/ui/Loading';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

export default function SongPage() {
  const params = useParams();
  const router = useRouter();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'cn' | 'en'>('cn');

  useEffect(() => {
    async function fetchSong() {
      if (params?.id) {
        try {
          const songData = await getSongById(params.id as string);
          setSong(songData);
        } catch (error) {
          console.error('Failed to fetch song:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchSong();
  }, [params?.id]);

  const navigateSong = (direction: 'prev' | 'next') => {
    if (!song) return;

    const currentId = parseInt(song.id);
    const newId = direction === 'prev' ? currentId - 1 : currentId + 1;

    if (newId >= 1) {
      router.push(`/song/${newId}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading />
      </div>
    );
  }

  if (!song) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">歌曲未找到</h1>
        <p className="text-muted-foreground mb-4">未找到编号为 {params?.id} 的歌曲</p>
        <button
          onClick={() => router.push('/')}
          className="text-primary hover:underline"
        >
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回列表 | Back to List
        </button>
      </div>

      <header className="mb-8 text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 text-muted-foreground">
          <span className="text-sm font-medium bg-muted px-3 py-1 rounded-full">
            #{song.id}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
          {song.title}
        </h1>

        <div className="flex items-center justify-center space-x-4">
          <SongActions song={song} language={language} onLanguageChange={setLanguage} />
        </div>
      </header>

      <main className="space-y-8">
        <BilingualLyrics song={song} language={language} />

        <nav className="flex justify-between items-center pt-8 border-t">
          <button
            onClick={() => navigateSong('prev')}
            disabled={parseInt(song.id) <= 1}
            className="flex items-center space-x-2 px-4 py-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>上一首 | Previous</span>
          </button>

          <button
            onClick={() => navigateSong('next')}
            className="flex items-center space-x-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>下一首 | Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      </main>
    </div>
  );
}