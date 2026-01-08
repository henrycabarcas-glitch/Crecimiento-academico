'use server';
/**
 * @fileoverview Manages user creation in Firebase Authentication using the Admin SDK.
 * This flow is executed on the server to securely create a new authentication user.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirebaseAdminApp } from '@/firebase/server';
import { getAuth } from 'firebase-admin/auth';

const CreateAuthUserInputSchema = z.object({
  email: z.string().email().describe('The email address for the new user.'),
  displayName: z.string().describe("The user's full name."),
  photoUrl: z.string().optional().describe("URL for the user's profile photo."),
});
export type CreateAuthUserInput = z.infer<typeof CreateAuthUserInputSchema>;

const CreateAuthUserOutputSchema = z.object({
  uid: z.string().describe('The UID of the newly created user.'),
  password: z.string().describe('The generated temporary password for the user.'),
});
export type CreateAuthUserOutput = z.infer<typeof CreateAuthUserOutputSchema>;

export async function createAuthUser(
  input: CreateAuthUserInput
): Promise<CreateAuthUserOutput> {
  const createAuthUserFlow = ai.defineFlow(
    {
      name: 'createAuthUserFlow',
      inputSchema: CreateAuthUserInputSchema,
      outputSchema: CreateAuthUserOutputSchema,
    },
    async (flowInput) => {
      const adminApp = getFirebaseAdminApp();
      const adminAuth = getAuth(adminApp);
      
      const password = 'pitufo' + Math.floor(1000 + Math.random() * 9000).toString();

      const userRecord = await adminAuth.createUser({
        email: flowInput.email,
        password: password,
        displayName: flowInput.displayName,
        photoURL: flowInput.photoUrl,
        emailVerified: false,
      });

      return {
        uid: userRecord.uid,
        password: password,
      };
    }
  );
  return createAuthUserFlow(input);
}
