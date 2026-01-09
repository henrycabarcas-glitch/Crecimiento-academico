'use server';
/**
 * @fileoverview Manages user deletion in Firebase Authentication using the Admin SDK.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirebaseAdminApp } from '@/firebase/server';
import { getAuth } from 'firebase-admin/auth';

const DeleteAuthUserInputSchema = z.object({
  uid: z.string().describe('The UID of the user to delete.'),
});
export type DeleteAuthUserInput = z.infer<typeof DeleteAuthUserInputSchema>;

const DeleteAuthUserOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type DeleteAuthUserOutput = z.infer<typeof DeleteAuthUserOutputSchema>;

export async function deleteAuthUser(
  input: DeleteAuthUserInput
): Promise<DeleteAuthUserOutput> {
  const deleteAuthUserFlow = ai.defineFlow(
    {
      name: 'deleteAuthUserFlow',
      inputSchema: DeleteAuthUserInputSchema,
      outputSchema: DeleteAuthUserOutputSchema,
    },
    async (flowInput) => {
      try {
        const adminApp = getFirebaseAdminApp();
        const adminAuth = getAuth(adminApp);
        
        await adminAuth.deleteUser(flowInput.uid);

        return {
          success: true,
          message: `Successfully deleted user ${flowInput.uid}`,
        };
      } catch (error: any) {
         console.error(`Error deleting user ${flowInput.uid}:`, error);
        // Re-throw the error to be caught by the client-side caller
        throw new Error(error.message || 'An unknown error occurred while deleting the user.');
      }
    }
  );
  return deleteAuthUserFlow(input);
}
