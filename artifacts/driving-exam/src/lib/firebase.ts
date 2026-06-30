import firebase from "firebase/compat/app";
import "firebase/compat/database";

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyDsN-OmtB-XFKGsYmX6zh_VvInCyE-rKtk",
    databaseURL: "https://al3arbicv-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "al3arbicv",
  });
}

export const db = firebase.database();
export default firebase;
