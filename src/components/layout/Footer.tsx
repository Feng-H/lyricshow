'use client';

import { Heart, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            <p>Made with <Heart className="inline w-4 h-4 text-red-500" /> for worship</p>
            <p className="mt-1">为赞美而建 | {new Date().getFullYear()}</p>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/Feng-H/lyricshow"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t text-xs text-muted-foreground text-center">
          <p>双语赞美诗歌词库 | Bilingual Praise Songs Lyrics Database</p>
          <p className="mt-1">支持全文搜索和拼音检索 | Full-text search with pinyin support</p>
        </div>
      </div>
    </footer>
  );
}