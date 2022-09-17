import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import type { User, NextOrObserver } from "firebase/auth";

import { auth } from "./provider";

//
// Retrieve the currently Authenticated User
//
export const getCurrentUser = (): Promise<User | null> =>
  new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (userAuth: User | null) => {
        unsubscribe();
        resolve(userAuth);
      },
      reject
    );
  });

//
// Create user and Sign in via the Authentication Provider (Firebase/Google)
//
export const createAuthUserWithEmailAndPassword = async (
  email: string,
  password: string
) => {
  if (!email || !password) return;
  //
  return await createUserWithEmailAndPassword(auth, email, password);
};

//
// Sign in the user using the Authentication Provider (Firebase/Google)
//
export const signInAuthUserWithEmailAndPassword = async (
  email: string,
  password: string
) => {
  if (!email || !password) return;
  //
  return await signInWithEmailAndPassword(auth, email, password);
};

//
// Sign out the authenticated user
//
export const signOutUser = async () => await signOut(auth);

//
// Propagate event to the callback provided, when auth state changes
//
export const onAuthStateChangedListener = (callback: NextOrObserver<User>) =>
  onAuthStateChanged(auth, callback);
