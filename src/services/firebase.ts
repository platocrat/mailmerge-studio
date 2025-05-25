import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Your Firebase configuration
// Note: In a production app, these would be in environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'demo-key',
  authDomain:
    process.env.FIREBASE_AUTH_DOMAIN ||
    'mailmerge-studio.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'mailmerge-studio',
  storageBucket:
    process.env.FIREBASE_STORAGE_BUCKET ||
    'mailmerge-studio.appspot.com',
  messagingSenderId:
    process.env.FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId:
    process.env.FIREBASE_APP_ID || '1:123456789:web:abcdef123456789',
}

let firebaseApp: any
let firestore: any

export const initializeFirebase = () => {
  try {
    if (!firebaseApp) {
      firebaseApp = initializeApp(firebaseConfig)
      firestore = getFirestore(firebaseApp)
      console.log('Firebase initialized successfully')
    }
    return { firebaseApp, firestore }
  } catch (error) {
    console.error('Error initializing Firebase:', error)
    throw error
  }
}

export const getFirestoreInstance = () => {
  if (!firestore) {
    const { firestore: db } = initializeFirebase()
    return db
  }
  return firestore
}

export default { initializeFirebase, getFirestoreInstance }
