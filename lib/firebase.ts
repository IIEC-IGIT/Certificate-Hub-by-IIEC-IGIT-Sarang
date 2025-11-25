import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAAzj_e-Efi1dUCmbpPq3Ooom3nL12X-EI",
    authDomain: "certificate-hub-b7177.firebaseapp.com",
    projectId: "certificate-hub-b7177",
    storageBucket: "certificate-hub-b7177.firebasestorage.app",
    messagingSenderId: "96363537330",
    appId: "1:96363537330:web:f08cc1ae48947288ee7aab",
    measurementId: "G-GT6VCYPWWK"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);

let analytics;
if (typeof window !== 'undefined') {
    isSupported().then(yes => yes && (analytics = getAnalytics(app)));
}

export { app, storage, analytics };
