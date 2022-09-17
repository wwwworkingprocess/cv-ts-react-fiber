import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithRedirect,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

//
// Firebase configuration
//
const getConfig = () => {
  const cfg = {
    projectId: "cv-react-ts",
    authDomain: "cv-react-ts.firebaseapp.com",
    storageBucket: "cv-react-ts.appspot.com",
  };
  //
  const getConfigFromEnv = () => ({
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY ?? "",
    appId: process.env.REACT_APP_FIREBASE_APP_ID ?? "",
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ?? "",
  });
  //
  const configWithSecret = { ...cfg, ...getConfigFromEnv() };
  //
  console.log("configWithSecret", configWithSecret);
  //
  return configWithSecret;
};

//
// Exporting Firebase App instance to ease testing & mocking
//
export const firebaseApp = initializeApp(getConfig());

//
// Setting up Auth
//
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export const auth = getAuth();
export const signInWithGooglePopup = () => signInWithPopup(auth, provider);
export const signInWithGoogleRedirect = () =>
  signInWithRedirect(auth, provider);

//
// Setting up Firestore
//
export const db = getFirestore();
