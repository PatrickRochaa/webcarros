import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCkVZuOp1g4uRgpofPhYvuk5LhKFHs6k1w",
  authDomain: "webcar-d83de.firebaseapp.com",
  projectId: "webcar-d83de",
  storageBucket: "webcar-d83de.appspot.com",
  messagingSenderId: "1023766410923",
  appId: "1:1023766410923:web:379ad9f9219daadc8d29ee",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
