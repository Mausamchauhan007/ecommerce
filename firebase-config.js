// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAh7b6iJUGXIV8eBbbOtAOT1Cgyt_p2f6Q",
  authDomain: "anicosmos-653e0.firebaseapp.com",
  projectId: "anicosmos-653e0",
  storageBucket: "anicosmos-653e0.firebasestorage.app",
  messagingSenderId: "846778707154",
  appId: "1:846778707154:web:b424c516b0d8d27dd5910b",
  measurementId: "G-M699RP2N9Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth }; 