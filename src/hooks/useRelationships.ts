'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UserInfo {
  id: string;
  name: string;
}

export interface Relationships {
  user: UserInfo;
  target: UserInfo | null;
  manittoId: string | null;
}

const STORAGE_KEY = 'relationships_cache';

// API에서 데이터 가져오기
const fetchRelationships = async (): Promise<Relationships> => {
  const res = await fetch('/api/auth/relationships');

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error('Failed to fetch relationships');
  }

  const data = await res.json();

  // localStorage에 저장
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to cache relationships:', error);
  }

  return data;
};

export function useRelationships() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [hydrated, setHydrated] = useState(false);

  // 클라이언트 마운트 후 localStorage에서 데이터 복원
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        queryClient.setQueryData(['relationships'], data);
      }
    } catch (error) {
      console.error('Failed to parse cached relationships:', error);
    }
    setHydrated(true);
  }, [queryClient]);

  const query = useQuery({
    queryKey: ['relationships'],
    queryFn: fetchRelationships,
    staleTime: Infinity, // 데이터가 절대 stale 되지 않음
    gcTime: Infinity, // 캐시가 절대 가비지 컬렉션되지 않음
    retry: false, // 401 에러시 재시도 안함
    enabled: hydrated, // hydration 완료 후에만 쿼리 실행
  });

  // 401 에러 처리
  if (query.error?.message === 'Unauthorized') {
    router.push('/login');
  }

  return query;
}
