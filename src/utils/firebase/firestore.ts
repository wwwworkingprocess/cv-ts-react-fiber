import {
  doc,
  collection,
  writeBatch,
  query,
  getDocs,
} from "firebase/firestore";

import { ObjectToAdd } from ".";
import { db } from "./provider";

//
// Batch insertion of a document array as a children of an existing Reference
//
export const addCollectionAndDocuments = async <T extends ObjectToAdd>(
  collectionKey: string,
  objectsToAdd: Array<T>,
  documentKeysToUse?: Array<string> // omit to use auto-generated unique ids
): Promise<void> => {
  if (!db) return;
  //
  const collectionRef = collection(db, collectionKey);
  const batch = writeBatch(db);
  //
  objectsToAdd.forEach((object, idx) => {
    const docKey = documentKeysToUse?.[idx];
    const docRef =
      documentKeysToUse && docKey
        ? doc(collectionRef, docKey)
        : doc(collectionRef);
    //
    batch.set(docRef, object);
  });
  //
  await batch.commit();
  //
  console.log("batch done");
};

//
// Generic function to retrieve a Firestore Collection
// from the specified path (e.g. "users")
//
export async function getFirestoreCollection<T>(
  path: string
): Promise<Array<T>> {
  if (!db) return [] as Array<T>;
  //
  const collectionRef = collection(db, path);
  //
  const q = query(collectionRef);
  const querySnapshop = await getDocs(q);
  //
  return querySnapshop.docs.map((docSnapshot) => docSnapshot.data() as T);
}
