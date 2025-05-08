import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDD6coY49gQGo7rkhcPQY6nUhftziODTPY",
  authDomain: "escape-portal-au.firebaseapp.com",
  projectId: "escape-portal-au",
  storageBucket: "escape-portal-au.firebasestorage.app",
  messagingSenderId: "917308365081",
  appId: "1:917308365081:web:1fb93c63b2b43ad9678d88",
  measurementId: "G-LQ50CD3219"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)


export { auth, db}
