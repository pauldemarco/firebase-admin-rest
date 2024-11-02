import { GetDocumentRes } from '../types';
import { TypedEnv } from '../types';
import {
	formatValuesWithType,
	generateFirebaseReqHeaders,
	googleDumbObjectToHuman,
	humanObjectToDumbGoogle,
	removeFirstAndLastSlash
} from './utils';

/**
 * Adds a new document to a Firestore collection using REST API.
 *
 * @param collectionPath - The path of the collection where the document will be added.
 * @param docData - The data of the document to be added.
 * @param options - Additional options for the operation.
 * @param options.db - The name of the Firestore database to use. (optional)
 * @returns A Promise that resolves to the result of the add operation.
 */
export async function addDocRest<T extends object>(
	collectionPath: string,
	docData: T,
	options?: {
		db?: string;
	}
): Promise<GetDocumentRes<T>> {
	const typedEnv = process.env as TypedEnv;
	const finalDb = options?.db || typedEnv.FIREBASE_REST_DATABASE_ID;
	collectionPath = removeFirstAndLastSlash(collectionPath);
	// const addDocRes = await setDocRest<T>(`${collectionPath}/${newDocId}`, docData, {
	// 	merge: false,
	// 	db: options?.db
	// });
	// return addDocRes;

	const dumbGoogleObject = humanObjectToDumbGoogle(docData);

	const res: any = await fetch(
		`https://firestore.googleapis.com/v1beta1/projects/${typedEnv.FIREBASE_REST_PROJECT_ID}/databases/${finalDb}/documents/${collectionPath}`,
		{
			method: 'POST',
			headers: generateFirebaseReqHeaders(finalDb),
			body: JSON.stringify({
				fields: dumbGoogleObject
			})
		}
	);
	if (res.status !== 200) {
		throw new Error(
			`Non 200 status req, error creating document at ${collectionPath} in Firestore `,
			res
		);
	}
	const jsonResponse = await res.json();
	const docId = jsonResponse.name.split('/').pop();
	const data = googleDumbObjectToHuman(jsonResponse.fields);
	return {
		id: docId,
		ref: `${collectionPath}/${docId}`,
		exists: () => true,
		data: () => data as T,
		jsonResponse
	};
	// return {
	// 	id: docId,
	// 	exists: () => true,
	// 	ref: docPath,
	// 	data: () => docData,
	// 	response: setDocRes
	// };
}
