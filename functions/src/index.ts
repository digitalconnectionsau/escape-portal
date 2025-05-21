import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

interface CreateOrganisationInput {
  orgName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  timezone: string;
}

export const createOrganisationWithAdmin = functions
  .region('australia-southeast1')
  .https.onCall(
    async (data: CreateOrganisationInput, context: functions.https.CallableContext) => {
      if (!context.auth || context.auth.token.role !== 'super-admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only super-admins can create organisations.');
      }

      const { orgName, firstName, lastName, email, password, timezone } = data;

      try {
        // Create user
        const userRecord = await admin.auth().createUser({ email, password });
        const userId = userRecord.uid;

        // Create user Firestore document
        await admin.firestore().doc(`Users/${userId}`).set({
          uid: userId,
          email,
          firstName,
          lastName,
          role: 'company-admin'
        });

        // Create organisation document
        const orgRef = await admin.firestore().collection('Organisations').add({
          organisationName: orgName,
          organisationAdminId: userId,
          status: 'active',
          timezone: timezone,
          primaryContact: {
            uid: userId,
            firstName,
            lastName,
            email
          }
        });

        // Update user with organisation ID
        await admin.firestore().doc(`Users/${userId}`).update({
          organisationId: orgRef.id
        });

        return {
          uid: userId,
          organisationId: orgRef.id
        };
      } catch (error) {
        console.error('[createOrganisationWithAdmin] Error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create organisation.');
      }
    }
  );
