import firebase from "firebase/app";
import "@firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: process.env.firebaseApiKey,
  authDomain: "carg-6ff57.firebaseapp.com",
  databaseURL: "https://carg-6ff57-default-rtdb.firebaseio.com",
  projectId: "carg-6ff57",
  storageBucket: "carg-6ff57.appspot.com",
  messagingSenderId: "114184953185",
  appId: "1:114184953185:web:0686d8d1246a65e4e8b920",
  measurementId: "G-PNWKK2XXR7",
};
// Initialize Firebase
var app = !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();

export function getFirebase() {
  return app;
}

export function getFirestore() {
  return firebase.firestore(app);
}
