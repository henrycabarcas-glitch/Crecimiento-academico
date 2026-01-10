'use client';
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, WithId } from '@/firebase';
import type { SchoolSettings } from '@/lib/types';

export interface UseSchoolSettingsResult {
  data: WithId<SchoolSettings> | null;
  isLoading: boolean;
  error: any;
}

const SETTINGS_DOC_ID = "main";

export function useSchoolSettings(): UseSchoolSettingsResult {
  const firestore = useFirestore();
  
  // Since the security rules now allow anyone to read the settings,
  // we can create the reference immediately without waiting for auth state.
  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', SETTINGS_DOC_ID);
  }, [firestore]);
  
  // useDoc will handle the null reference case while Firebase is initializing.
  const { data, isLoading, error } = useDoc<SchoolSettings>(settingsRef);
  
  return { data, isLoading, error };
}
