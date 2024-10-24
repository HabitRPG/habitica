import admin from 'firebase-admin';
import nconf from 'nconf';

if (nconf.get('FIREBASE_PROJECT_ID') !== undefined && nconf.get('FIREBASE_PROJECT_ID') !== '') {
  if (!global.firebaseApp) {
    global.firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: nconf.get('FIREBASE_PROJECT_ID'),
        clientEmail: nconf.get('FIREBASE_CLIENT_EMAIL'),
        privateKey: nconf.get('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
      }),
    });
  }
}
