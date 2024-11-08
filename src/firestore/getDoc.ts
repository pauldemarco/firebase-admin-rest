// import { generateFirebaseReqHeaders } from "./utils";

import { GetDocumentRes, TypedEnv } from 'src/types';
import { formatValuesWithType, generateFirebaseReqHeaders } from './utils';

// export interface GetDocumentRes<T = any> {
//     id: any,
//     ref: any,
// }

export async function getDocRest<T = any>(
	docPath: string,
	options?: {
		db?: string;
		debug?: boolean;
	}
): Promise<GetDocumentRes<T>> {
	const typedEnv = process.env as TypedEnv;
	const finalDb = options?.db || typedEnv.FIREBASE_REST_DATABASE_ID;
	try {
		const response: any = await fetch(
			`https://firestore.googleapis.com/v1/projects/${typedEnv.FIREBASE_REST_PROJECT_ID}/databases/${finalDb}/documents/${docPath}`,
			{
				method: 'GET',
				headers: generateFirebaseReqHeaders(finalDb)
			}
		).then((res) => res.json());

		if (
			response.error &&
			// Proceed if the document was simply not found
			!(response.error.code === 404 && response.error.status === 'NOT_FOUND')
		) {
			throw new Error(response.error.message);
		}

		if (response?.fields) {
			return {
				id: docPath.includes(`/`) ? docPath.split('/').pop() || docPath : docPath,
				ref: docPath,
				exists: () => true,
				data: () => formatValuesWithType(response),
				jsonResponse: response
			};
		} else {
			return {
				id: docPath.includes(`/`) ? docPath.split('/').pop() || docPath : docPath,
				ref: docPath,
				exists: () => false,
				data: () => undefined,
				jsonResponse: response
			};
		}
	} catch (error) {
		console.error(error);
		throw new Error(`Error fetching document from Firestore: `);
	}
}
