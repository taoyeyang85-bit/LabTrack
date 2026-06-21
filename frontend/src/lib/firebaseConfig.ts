// Firebase web config for labtrack-f1e40. These values are public (not secret).
// Env vars override defaults for other environments. See Firebase docs on API key restrictions.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBCfcyoC259WCDa0FPbG9wOsmk57OjGIgQ',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'labtrack-f1e40.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'labtrack-f1e40',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'labtrack-f1e40.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1072863240985',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID || '1:1072863240985:web:d5487e993c331395579b88',
};
