import { beforeAll, describe, expect, test } from 'vitest';
import serviceAccount from '../../testServiceAccount.json';
import { initFirebaseRest } from 'src/admin';
import { FirestoreOperations } from './RestFirestoreInstance';

describe('firestore tests', () => {
	let db: FirestoreOperations;

	beforeAll(async () => {
		const app = initFirebaseRest({
			serviceAccount: serviceAccount
		});
		db = await app.firestore();
	});

	test('document.exists() should return false for documents not existing', async () => {
		const doc = await db.doc('users/johndoe').get();

		expect(doc.exists()).toBe(false);
	});

	test('', async () => {
		const doc = await db.doc('users/johndoe').get();

		expect(doc.exists()).toBe(false);
	});
});
