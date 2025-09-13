// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANXcg1xdD4caDNnaBQ_l88JjVQeJRVKCg",
  authDomain: "ai-assis-73833.firebaseapp.com",
  projectId: "ai-assis-73833",
  storageBucket: "ai-assis-73833.firebasestorage.app",
  messagingSenderId: "625802813305",
  appId: "1:625802813305:web:878096137b82add38599a8",
  measurementId: "G-T0SBNYG29D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const firestoreDb = getFirestore(app);