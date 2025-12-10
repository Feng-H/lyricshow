export interface Song {
  id: string;
  title: string;
  cn_lines: string[];
  en_lines: string[];
  searchIndex?: SearchIndex;
}

export interface SearchIndex {
  titlePinyin: string;
  cnPinyin: string[];
  keywords: string[];
}

export interface SearchOptions {
  query: string;
  language?: 'cn' | 'en' | 'both';
  includePinyin?: boolean;
}

export interface SongMeta {
  id: string;
  title: string;
  preview: {
    cn: string;
    en: string;
  };
}