import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your actual Firebase project configuration from Google Cloud Console
// You can find this in Project Settings > General > Your Apps
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "getaroag-app.firebaseapp.com",
  projectId: "getaroag-app",
  storageBucket: "getaroag-app.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Initialize Firebase
// Note: In a real environment, we would check if apps are already initialized
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper to simulate authentication check for the demo
export const checkAuthStatus = (): boolean => {
  return localStorage.getItem('isLoggedIn') === 'true';
};