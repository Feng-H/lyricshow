'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const router = useRouter();

  // 简化登录，直接调用 onLogin
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onLogin();
    }, 500);

    return () => clearTimeout(timer);
  }, [onLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">正在登录... | Logging in...</p>
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="text-primary hover:text-primary/600 text-sm"
          >
            返回首页 | Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}