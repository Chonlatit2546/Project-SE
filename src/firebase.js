// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import {getFirestore} from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-hMHodtTH7ZWG2uZ8MXoOz83kHy2UDcA",
  authDomain: "seproject-cff60.firebaseapp.com",
  projectId: "seproject-cff60",
  storageBucket: "seproject-cff60.appspot.com",
  messagingSenderId: "463769850964",
  appId: "1:463769850964:web:04784e65ae431af1f109c1",
  measurementId: "G-YDNPM02NB8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
export {db};