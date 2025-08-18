// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCdrFXf2UY4lUaYHfVqIcswNIXDK_9X6Jg",
  authDomain: "subway-e883b.firebaseapp.com",
  projectId: "subway-e883b",
  storageBucket: "subway-e883b.firebasestorage.app",
  messagingSenderId: "1021707559236",
  appId: "1:1021707559236:web:845b41d80a9ccdb6363711",
  measurementId: "G-YPDPML4X67"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {db}
