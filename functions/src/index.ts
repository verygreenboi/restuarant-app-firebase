import { FunctionParser } from 'firebase-backend';
import * as admin from 'firebase-admin';
admin.initializeApp();
exports = new FunctionParser(__dirname, exports).exports;
