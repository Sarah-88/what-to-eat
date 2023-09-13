// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: "what-to-eat-bc4cf.firebaseapp.com",
    projectId: "what-to-eat-bc4cf",
    storageBucket: "what-to-eat-bc4cf.appspot.com",
    messagingSenderId: "905684417532",
    appId: "1:905684417532:web:20f209d3851d9e8d86d079"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app)