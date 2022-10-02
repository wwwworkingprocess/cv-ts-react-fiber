import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithRedirect,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const getCloudEnabled = () => {
  const configFromEnv = process.env.REACT_APP_FIREBASE_ENABLED ?? "FALSE";
  //
  return configFromEnv === "TRUE";
};

export const IS_CLOUD_ENABLED = getCloudEnabled();
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
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID ?? "",
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ?? "",
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ?? "",
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY ?? "",
    appId: process.env.REACT_APP_FIREBASE_APP_ID ?? "",
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ?? "",
  });
  //
  const configWithSecret = { ...cfg, ...getConfigFromEnv() };
  //
  alert(JSON.stringify(configWithSecret));
  //
  return configWithSecret;
};

//
// Exporting Firebase App instance to ease testing & mocking
//
export const firebaseApp = IS_CLOUD_ENABLED
  ? initializeApp(getConfig())
  : undefined;

//
// Setting up Auth
//
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export const auth = IS_CLOUD_ENABLED ? getAuth() : undefined;
export const signInWithGooglePopup = () =>
  auth ? signInWithPopup(auth, provider) : Promise.resolve(undefined);
export const signInWithGoogleRedirect = () =>
  auth && signInWithRedirect(auth, provider);

//
// Setting up Firestore
//
export const db = IS_CLOUD_ENABLED ? getFirestore() : undefined;
export const storage = IS_CLOUD_ENABLED ? getStorage(firebaseApp) : undefined;
