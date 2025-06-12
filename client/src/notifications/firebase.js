import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "callify-notifications.firebaseapp.com",
  projectId: "callify-notifications",
  storageBucket: "callify-notifications.firebasestorage.app",
  messagingSenderId: "205176776705",
  appId: "1:205176776705:web:0b77ec145c05d9184b3800"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const generateToken = async () => {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
        console.error("Permission not granted for Notification");
        return;
    }
    try{
        const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
        })
        return token;
    }
    catch(err) {
        console.error("An error occurred while retrieving token. ", err);
    };
}