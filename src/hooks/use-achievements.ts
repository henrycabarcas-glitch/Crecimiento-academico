'use client';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, WithId } from '@/firebase';
import type { Achievement } from '@/lib/types';

export interface UseAchievementsResult {
  data: WithId<Achievement>[] | null;
  isLoading: boolean;
  error: any;
}

export function useAchievements(courseId?: string): UseAchievementsResult {
  const firestore = useFirestore();
  
  const achievementsCollection = useMemoFirebase(() => {
    if (!courseId) return null;
    return collection(firestore, 'courses', courseId, 'achievements');
  }, [firestore, courseId]);

  const { data, isLoading, error } = useCollection<Achievement>(achievementsCollection);

  return { data, isLoading, error };
}
