import { Song, SearchIndex } from './types';

// Cache for loaded songs - now keyed by filename
let songsCache: { [filename: string]: Song[] } = {};

// Simple pinyin-like conversion for basic search (no external dependency)
const pinyinMap: { [key: string]: string[] } = {
  'a': ['a', 'ā', 'á', 'ǎ', 'à'],
  'e': ['e', 'ē', 'é', 'ě', 'è'],
  'i': ['i', 'ī', 'í', 'ǐ', 'ì'],
  'o': ['o', 'ō', 'ó', 'ǒ', 'ò'],
  'u': ['u', 'ū', 'ú', 'ǔ', 'ù'],
  'v': ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
  'ai': ['ai', 'āi', 'ái', 'ǎi', 'ài'],
  'ei': ['ei', 'ēi', 'éi', 'ěi', 'èi'],
  'ui': ['ui', 'ūi', 'úi', 'ǔi', 'ùi'],
  'ao': ['ao', 'āo', 'áo', 'ǎo', 'ào'],
  'ou': ['ou', 'ōu', 'óu', 'ǒu', 'òu'],
  'iu': ['iu', 'īu', 'íu', 'ǐu', 'ìu'],
  'ie': ['ie', 'īe', 'íe', 'ǐe', 'ìe'],
  'üe': ['üe', 'ǖe', 'ǘe', 'ǚe', 'ǜe'],
  'er': ['er', 'ēr', 'ér', 'ěr', 'èr'],
  'an': ['an', 'ān', 'án', 'ǎn', 'àn'],
  'en': ['en', 'ēn', 'én', 'ěn', 'èn'],
  'in': ['in', 'īn', 'ín', 'ǐn', 'ìn'],
  'un': ['un', 'ūn', 'ún', 'ǔn', 'ùn'],
  'ang': ['ang', 'āng', 'áng', 'ǎng', 'àng'],
  'eng': ['eng', 'ēng', 'éng', 'ěng', 'èng'],
  'ing': ['ing', 'īng', 'íng', 'ǐng', 'ìng'],
  'ong': ['ong', 'ōng', 'óng', 'ǒng', 'òng'],
  'zh': ['z', 'h', 'zh', 'ch', 'sh', 'r'],
  'ch': ['c', 'h', 'zh', 'ch', 'sh', 'r'],
  'sh': ['s', 'h', 'zh', 'ch', 'sh', 'r'],
};

function simplePinyinMatch(text: string, query: string): boolean {
  // Very simple pinyin-like matching for common characters
  // This is a basic implementation without external dependencies
  const commonPinyin: { [char: string]: string[] } = {
    '的': ['de', 'd'],
    '是': ['shi', 's'],
    '在': ['zai', 'z'],
    '有': ['you', 'y'],
    '不': ['bu', 'b'],
    '了': ['le', 'l'],
    '人': ['ren', 'r'],
    '我': ['wo', 'w'],
    '他': ['ta', 't'],
    '她': ['ta', 't'],
    '它': ['ta', 't'],
    '们': ['men', 'm'],
    '这': ['zhe', 'z'],
    '那': ['na', 'n'],
    '你': ['ni', 'n'],
    '爱': ['ai', 'a'],
    '神': ['shen', 's'],
    '主': ['zhu', 'z'],
    '耶': ['ye', 'y'],
    '稣': ['su', 's'],
    '基': ['ji', 'j'],
    '督': ['du', 'd'],
    '圣': ['sheng', 's'],
    '灵': ['ling', 'l'],
    '恩': ['en', 'e'],
    '赐': ['ci', 'c'],
    '救': ['jiu', 'j'],
    '赎': ['shu', 's'],
    '赞': ['zan', 'z'],
    '美': ['mei', 'm'],
    '荣': ['rong', 'r'],
    '光': ['guang', 'g'],
    '和': ['he', 'h'],
    '平': ['ping', 'p'],
    '安': ['an', 'a'],
    '喜': ['xi', 'x'],
    '乐': ['le', 'l'],
    '福': ['fu', 'f'],
    '气': ['qi', 'q'],
    '力': ['li', 'l'],
    '量': ['liang', 'l'],
    '心': ['xin', 'x'],
    '手': ['shou', 's'],
    '脚': ['jiao', 'j'],
    '口': ['kou', 'k'],
    '眼': ['yan', 'y'],
    '耳': ['er', 'e'],
    '声': ['sheng', 's'],
    '音': ['yin', 'y'],
    '歌': ['ge', 'g'],
    '唱': ['chang', 'c'],
    '祷': ['dao', 'd'],
    '告': ['gao', 'g'],
  };

  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  // Direct match
  if (textLower.includes(queryLower)) return true;

  // Check each character for pinyin match
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const pinyins = commonPinyin[char];
    if (pinyins) {
      for (const pinyin of pinyins) {
        if (pinyin.startsWith(queryLower) || queryLower.startsWith(pinyin)) {
          return true;
        }
      }
    }
  }

  return false;
}

export async function loadSongs(filename: string = 'praisesongs_data.json'): Promise<Song[]> {
  // Check cache first
  if (songsCache[filename]) {
    return songsCache[filename];
  }

  try {
    const response = await fetch(`/data/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load songs data from ${filename}`);
    }

    const songs: Song[] = await response.json();

    // Create search index for each song (without pinyin library)
    const songsWithIndex = songs.map(song => ({
      ...song,
      searchIndex: createSearchIndex(song)
    }));

    // Cache the result
    songsCache[filename] = songsWithIndex;
    return songsWithIndex;
  } catch (error) {
    console.error(`Error loading songs from ${filename}:`, error);
    return [];
  }
}

export async function getSongById(id: string, filename: string = 'praisesongs_data.json'): Promise<Song | null> {
  const songs = await loadSongs(filename);
  return songs.find(song => song.id === id) || null;
}

export async function searchSongs(query: string, limit: number = 50, filename: string = 'praisesongs_data.json'): Promise<Song[]> {
  const songs = await loadSongs(filename);

  if (!query.trim()) {
    return songs.slice(0, limit);
  }

  const queryLower = query.toLowerCase();

  // Score each song based on relevance
  const scoredSongs = songs.map(song => {
    let score = 0;

    // Exact title match
    if (song.title.toLowerCase().includes(queryLower)) {
      score += 100;
    }

    // Simple pinyin-like search for Chinese
    const cnText = song.cn_lines.join(' ');
    if (simplePinyinMatch(cnText, query)) {
      score += 50;
    }

    // Content match
    const cnMatch = song.cn_lines.some(line =>
      line.toLowerCase().includes(queryLower)
    );
    if (cnMatch) score += 40;

    const enMatch = song.en_lines.some(line =>
      line.toLowerCase().includes(queryLower)
    );
    if (enMatch) score += 40;

    // ID match for quick navigation
    if (song.id === query) {
      score += 200;
    }

    // Partial pinyin match
    if (queryLower.length >= 2) {
      const pinyinMatch = simplePinyinMatch(song.title, query);
      if (pinyinMatch) score += 30;
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
  // Simple search index without pinyin library
  const keywords = [
    ...song.title.split(/\s+/),
    ...song.cn_lines.flatMap(line => line.split(/[\s，。、]+/)),
    ...song.en_lines.flatMap(line => line.split(/[\s,.!?]+/))
  ].filter(word => word.length > 1);

  return {
    titlePinyin: song.title.toLowerCase(), // No real pinyin, just lowercase
    cnPinyin: song.cn_lines.map(line => line.toLowerCase()), // No real pinyin
    keywords: keywords.map(k => k.toLowerCase())
  };
}