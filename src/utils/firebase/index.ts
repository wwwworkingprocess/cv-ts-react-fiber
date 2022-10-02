import { User } from "firebase/auth";
import { doc, getDoc, QueryDocumentSnapshot, setDoc } from "firebase/firestore";

import { db } from "./provider";

//
// Typings for user creation
//
export type ObjectToAdd = Record<string, any>;
export type AdditionalInformation = { displayName?: string };
export type UserData = {
  createdAt: Date;
  displayName: string;
  email: string;
};

//
// Creating a Firestore document from the data
// received from the Authentication Provider
//
export const createUserDocumentFromAuth = async (
  userAuth: User,
  additionalInformation = {} as AdditionalInformation
): Promise<void | QueryDocumentSnapshot<UserData>> => {
  if (!db) {
    console.warn("Cloud functionality seems disabled.");
    return;
  }
  //
  if (!userAuth) return;
  //
  const userDocRef = doc(db, "users", userAuth.uid);
  //
  const userSnapshot = await getDoc(userDocRef);
  const userExists = userSnapshot.exists();
  //
  if (!userExists) {
    const { displayName, email } = userAuth;
    const createdAt = new Date();
    //
    try {
      const newUser = {
        email,
        displayName,
        createdAt,
        ...additionalInformation,
      };
      await setDoc(userDocRef, newUser);
    } catch (ex) {
      console.error("failed", ex);
    }
  }
  //
  return userSnapshot as QueryDocumentSnapshot<UserData>;
};
