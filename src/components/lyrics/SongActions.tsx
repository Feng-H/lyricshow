'use client';

import { useState } from 'react';
import { Song } from '@/lib/types';
import { Languages, Share2, Printer, Moon, Sun } from 'lucide-react';
import { copyToClipboard, getShareUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SongActionsProps {
  song: Song;
  language: 'cn' | 'en';
  onLanguageChange: (lang: 'cn' | 'en') => void;
}

export function SongActions({ song, language, onLanguageChange }: SongActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = getShareUrl(song.id);
    const success = await copyToClipboard(url);

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleLanguage = () => {
    onLanguageChange(language === 'cn' ? 'en' : 'cn');
  };

  return (
    <div className="flex items-center space-x-2 no-print">
      <button
        onClick={toggleLanguage}
        className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        aria-label="Toggle language"
      >
        <Languages className="w-4 h-4" />
        <span>{language === 'cn' ? '中文' : 'English'}</span>
      </button>

      <button
        onClick={handleShare}
        className={cn(
          "flex items-center space-x-2 px-3 py-1.5 text-sm border rounded-lg transition-colors",
          copied
            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400"
            : "hover:bg-muted text-muted-foreground hover:text-foreground"
        )}
        aria-label="Share song"
      >
        <Share2 className="w-4 h-4" />
        <span>{copied ? '已复制!' : '分享'}</span>
      </button>

      <button
        onClick={handlePrint}
        className="flex items-center space-x-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Print song"
      >
        <Printer className="w-4 h-4" />
        <span>打印</span>
      </button>
    </div>
  );
}