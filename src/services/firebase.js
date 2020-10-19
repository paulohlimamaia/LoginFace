import firebase from 'firebase';

const FirebaseConfig = {
    apiKey: "AIzaSyCcbE3JWVerh7DzMM3QqKiuUfstEfYpBD0",
    authDomain: "loginlanlink.firebaseapp.com",
    databaseURL: "https://loginlanlink.firebaseio.com",
    projectId: "loginlanlink",
    storageBucket: "loginlanlink.appspot.com",
    messagingSenderId: "606930949416",
    appId: "1:606930949416:web:9f14feaff7ad258e766c1d"

};

const FireBase = firebase.initializeApp(FirebaseConfig)

export default FireBase;