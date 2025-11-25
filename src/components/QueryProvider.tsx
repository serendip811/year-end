'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Infinity, // 데이터가 절대 stale 되지 않음
            gcTime: Infinity, // 캐시가 절대 가비지 컬렉션되지 않음
            refetchOnWindowFocus: false, // 윈도우 포커스시 리페치 안함
            refetchOnMount: false, // 마운트시 리페치 안함
            refetchOnReconnect: false, // 재연결시 리페치 안함
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
