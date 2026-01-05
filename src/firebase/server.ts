import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { firebaseConfig } from './config';

// IMPORTANT: DO NOT MODIFY THIS FILE
export function getFirebaseAdminApp(): App {
  if (getApps().length) {
    return getApp();
  }

  // Set the GOOGLE_APPLICATION_CREDENTIALS environment variable
  return initializeApp({
    // Use the projectId from the client-side config
    projectId: firebaseConfig.projectId,
  });
}
