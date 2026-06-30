import firebase from "firebase/compat/app";
import "firebase/compat/database";

const firebaseConfig = {
  apiKey: "AIzaSyDsN-OmtB-XFKGsYmX6zh_VvInCyE-rKtk",
  databaseURL: "https://al3arbicv-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "al3arbicv",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firebase.database();
export default firebase;
