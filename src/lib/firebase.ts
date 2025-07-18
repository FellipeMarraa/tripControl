import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyAqNXzQ7wI81PDgcHCeOE9n1MEYdtXVevo",
    authDomain: "trip-control-2e468.firebaseapp.com",
    projectId: "trip-control-2e468",
    storageBucket: "trip-control-2e468.firebasestorage.app",
    messagingSenderId: "617955025254",
    appId: "1:617955025254:web:713602e5e42b08640e28a7",
    measurementId: "G-QPRBR0WVTH"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
