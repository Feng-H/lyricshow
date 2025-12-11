'use client';

import { useEffect, useState } from 'react';
import { DataSourceProvider, useDataSource } from '@/contexts/DataSourceContext';

function DataSourceProviderInner({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render after component is mounted on client
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <DataSourceProvider>
      {children}
    </DataSourceProvider>
  );
}

export function DataSourceProviderWrapper({ children }: { children: React.ReactNode }) {
  return <DataSourceProviderInner>{children}</DataSourceProviderInner>;
}