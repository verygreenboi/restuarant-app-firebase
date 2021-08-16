import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// const db = admin.firestore();

exports.onOrderCreated = functions.firestore
  .document('orderCalls/{orderId}')
  .onCreate(async (orderSnapshot, context) => {
    const result = await admin.auth().listUsers();
    const now = admin.firestore.Timestamp.now();
    await orderSnapshot.ref.update({ status: 'pending', createdAt: now, updatedAt: now });
    const users = result.users.filter(user => (user.customClaims as any).role === 'waiter').map(user => {
      const val = user.toJSON();
      const allowed = (val: any) => {
        return typeof val === 'string' ||
          typeof val === 'number' ||
          typeof val === 'boolean' ||
          val instanceof Date ||
          Array.isArray(val);
      }
      const sanitize = (obj: {[key: string]: any}) => {
        const keys = Object.keys(obj);
        const result: any = {};
        for (const key of keys) {
          if (allowed(obj[key])) {
            result[key] = obj[key];
          }
          if (typeof obj[key] === 'object' && !obj[key].length) {
            result[key] = {
              ...sanitize(obj[key])
            };
          }
          if (obj[key] === undefined) {
            result[key] = null;
          }
        }
        return result;
      }
      return sanitize(val);
    });
    functions.logger.log({ users: JSON.stringify(users) });

    if (users.length > 0) {
      try {
        const { uid: id, email, displayName, phoneNumber} = users[0];
        const assignedTime = admin.firestore.Timestamp.now();
        return await orderSnapshot.ref.update({ status: 'assigned', assignee: { id, email, displayName, phoneNumber }, updatedAt: assignedTime });
      } catch (e) {
        functions.logger.error(e);
        return {
          message: e.message
        }
      }
    } else {
      return {
        message: `No servers found`
      }
    }
  });
