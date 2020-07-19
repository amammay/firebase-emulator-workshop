const functions = require('firebase-functions');
const admin = require('firebase-admin')
const adminApp = admin.initializeApp();
const firestore = adminApp.firestore();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
exports.buttonHit = functions.firestore.document('buttonPresser/{docId}').onCreate(async (snapshot, context) => {
  await snapshot.ref.update({server: 'side'})
})

exports.deleteAll = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'No Auth provided')
  }
  const allDocs = await firestore.collection('buttonPresser').listDocuments();

  const deleter = async (ref) => await ref.delete();
  let promiseArray = [];
  for (const firestoreElement of allDocs) {
    promiseArray.push(deleter(firestoreElement));
  }
  await Promise.all(promiseArray);

})
