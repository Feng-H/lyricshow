import { Song, SearchIndex } from './types';
import pinyin from 'pinyin';

// Cache for loaded songs
let songsCache: Song[] | null = null;

export async function loadSongs(): Promise<Song[]> {
  if (songsCache) {
    return songsCache;
  }

  try {
    const response = await fetch('/data/praisesongs_data.json');
    if (!response.ok) {
      throw new Error('Failed to load songs data');
    }

    const songs: Song[] = await response.json();

    // Create search index for each song
    const songsWithIndex = songs.map(song => ({
      ...song,
      searchIndex: createSearchIndex(song)
    }));

    songsCache = songsWithIndex;
    return songsWithIndex;
  } catch (error) {
    console.error('Error loading songs:', error);
    return [];
  }
}

export async function getSongById(id: string): Promise<Song | null> {
  const songs = await loadSongs();
  return songs.find(song => song.id === id) || null;
}

export async function searchSongs(query: string, limit: number = 50): Promise<Song[]> {
  const songs = await loadSongs();

  if (!query.trim()) {
    return songs.slice(0, limit);
  }

  const queryLower = query.toLowerCase();
  const queryPinyin = pinyin(query, { style: pinyin.STYLE_NORMAL }).join(' ');

  // Score each song based on relevance
  const scoredSongs = songs.map(song => {
    let score = 0;

    // Exact title match
    if (song.title.toLowerCase().includes(queryLower)) {
      score += 100;
    }

    // Pinyin title match
    if (song.searchIndex?.titlePinyin.includes(queryLower)) {
      score += 80;
    }

    // Content match
    const cnMatch = song.cn_lines.some(line =>
      line.toLowerCase().includes(queryLower)
    );
    if (cnMatch) score += 50;

    const enMatch = song.en_lines.some(line =>
      line.toLowerCase().includes(queryLower)
    );
    if (enMatch) score += 50;

    // Pinyin content match
    if (song.searchIndex?.cnPinyin.some(pinyin =>
      pinyin.includes(queryLower)
    )) {
      score += 30;
    }

    // ID match for quick navigation
    if (song.id === query) {
      score += 200;
    }

    return { song, score };
  });

  // Filter and sort by relevance
  return scoredSongs
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.song);
}

function createSearchIndex(song: Song): SearchIndex {
  const titlePinyin = pinyin(song.title, {
    style: pinyin.STYLE_NORMAL,
    heteronym: false
  }).flat().join(' ');

  const cnPinyin = song.cn_lines.map(line =>
    pinyin(line, {
      style: pinyin.STYLE_NORMAL,
      heteronym: false
    }).flat().join(' ')
  );

  // Extract keywords (remove common words)
  const keywords = [
    ...song.title.split(/\s+/),
    ...song.cn_lines.flatMap(line => line.split(/[\s，。、]+/)),
    ...song.en_lines.flatMap(line => line.split(/[\s,.!?]+/))
  ].filter(word => word.length > 1);

  return {
    titlePinyin: titlePinyin.toLowerCase(),
    cnPinyin: cnPinyin.map(p => p.toLowerCase()),
    keywords: keywords.map(k => k.toLowerCase())
  };
}