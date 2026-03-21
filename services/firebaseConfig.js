import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDujxBA5PxIWEx6bQc6689jVB7zuOu-6kE",
  authDomain: "voltpc-1567b.firebaseapp.com",
  projectId: "voltpc-1567b",
  storageBucket: "voltpc-1567b.firebasestorage.app",
  messagingSenderId: "948061297396",
  appId: "1:948061297396:web:ae8568e8f213bd804b1ca1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
