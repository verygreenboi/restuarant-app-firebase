import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

exports.onCreateUser = functions.auth.user().onCreate(async (rec) => {
  const now = admin.firestore.Timestamp.now();
  const user = await admin.auth().getUser(rec.uid);
  const { customClaims: claim, email, uid: id, displayName: name, phoneNumber: phone, photoURL: avatar } = user;
  if (claim && (claim as any).role === 'waiter') {
    await db.collection(`waiters`).doc(`${user.uid}`).set({
      idle: true,
      email: email ? email : null,
      name: name ? name : null,
      id,
      phone: phone ? phone : null,
      avatar: avatar ? avatar : null,
      idleSince: now
    });
  }
})
