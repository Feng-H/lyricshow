'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FileInfo {
  name: string;
  size: number;
  modified: string;
}

interface DataSourceContextType {
  selectedFile: string | null;
  setSelectedFile: (file: string | null) => void;
  files: FileInfo[];
  refreshFiles: () => Promise<void>;
}

const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined);

export function useDataSource() {
  const context = useContext(DataSourceContext);
  if (context === undefined) {
    throw new Error('useDataSource must be used within a DataSourceProvider');
  }
  return context;
}

interface DataSourceProviderProps {
  children: ReactNode;
}

export function DataSourceProvider({ children }: DataSourceProviderProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);

  // Load selected file from localStorage on mount (client-side only)
  useEffect(() => {
    // Only access localStorage on the client side
    if (typeof window !== 'undefined') {
      const savedFile = localStorage.getItem('selectedDataSource');
      if (savedFile) {
        setSelectedFile(savedFile);
      }
    }
  }, []);

  // Load initial file list
  useEffect(() => {
    refreshFiles();
  }, []);

  const refreshFiles = async () => {
    try {
      const response = await fetch('/api/admin/files');
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  // Wrap setSelectedFile to also save to localStorage
  const handleSetSelectedFile = (file: string | null) => {
    setSelectedFile(file);
    // Only access localStorage on the client side
    if (typeof window !== 'undefined') {
      if (file) {
        localStorage.setItem('selectedDataSource', file);
      } else {
        localStorage.removeItem('selectedDataSource');
      }
    }
  };

  const value: DataSourceContextType = {
    selectedFile,
    setSelectedFile: handleSetSelectedFile,
    files,
    refreshFiles
  };

  return (
    <DataSourceContext.Provider value={value}>
      {children}
    </DataSourceContext.Provider>
  );
}