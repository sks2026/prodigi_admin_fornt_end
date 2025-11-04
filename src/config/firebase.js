// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDhyTlrg7ZwaFiqWDmke0hR6_zrIc0wWqg",
  authDomain: "prodigimvp1.firebaseapp.com",
  projectId: "prodigimvp1",
  storageBucket: "prodigimvp1.firebasestorage.app",
  messagingSenderId: "941526703325",
  appId: "1:941526703325:web:126e92cb911bacae7c4f34",
  measurementId: "G-G4X1TQYP90"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google Provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Google Sign In Function
export const signInWithGooglePopup = () => {
  return signInWithPopup(auth, googleProvider);
};

// Sign Out Function
export const signOutUser = () => {
  return signOut(auth);
};

export default app;