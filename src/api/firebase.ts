import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCvA-rlLOV0I5E4XgCJonC5F1DcInLCFTE",
  authDomain: "peakfuel-56430.firebaseapp.com",
  projectId: "peakfuel-56430",
  storageBucket: "peakfuel-56430.firebasestorage.app",
  messagingSenderId: "1016840051086",
  appId: "1:1016840051086:web:10cf2b78172cac731eecdf",
  measurementId: "G-EKM64W5DG1"
};

// Prevent duplicate initialization in Expo/Next hot-reload environments
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
