const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Ensure this file is in the project root!

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ✅ Replace this with the UID from Firebase Authentication (NOT Firestore)
const uid = 'onEaTCHRFDhTQJ9Rnf6BubHJP9B2';

// ✅ Set the role exactly as required by Firestore Rules
admin.auth().setCustomUserClaims(uid, { role: 'super-admin' })
  .then(async () => {
    console.log('✅ Custom claims set for user.');

    // Optional: Verify that the claims have been set correctly
    const user = await admin.auth().getUser(uid);
    console.log('📋 Current Custom Claims:', user.customClaims);

    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error setting custom claims:', error);
    process.exit(1);
  });
