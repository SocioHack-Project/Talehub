// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, update, remove } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDm2jbu7Jn94fDTCiRxVg0UrbSzE76mbi8",
  authDomain: "collaborative-storyediter.firebaseapp.com",
  projectId: "collaborative-storyediter",
  storageBucket: "collaborative-storyediter.firebasestorage.app",
  messagingSenderId: "856513517716",
  appId: "1:856513517716:web:176190dd3172a268d37c81",
  measurementId: "G-1B2H6WE61W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export { database, ref, get, set, update, remove };