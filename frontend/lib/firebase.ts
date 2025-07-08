import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCll6iKy3QXL1q9hTc_phgjUAAbXf2eXpQ",
  authDomain: "ai-for-second-lives-c113b.firebaseapp.com",
  projectId: "ai-for-second-lives-c113b",
  storageBucket: "ai-for-second-lives-c113b.appspot.com",
  messagingSenderId: "418821996532",
  appId: "1:418821996532:web:4cfeb33adaeb792b2d03a1",
  measurementId: "G-K37DN10Y3J"
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app); 