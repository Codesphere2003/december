import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCAbXN9unFCNvTO2HtxFdgZkTA9NMcjJUo",
  authDomain: "diety-204b0.firebaseapp.com",
  projectId: "diety-204b0",
  storageBucket: "diety-204b0.firebasestorage.app",
  messagingSenderId: "1071397904810",
  appId: "1:1071397904810:web:7c157fa97c81ba3f104bd3",
  measurementId: "G-L3ZX67149E"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
