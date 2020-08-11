import { Injectable } from '@angular/core';
import * as firebase from 'firebase'
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  firebaseConfig = {
    apiKey: "AIzaSyCDEHt_2BogUlUqHikJLGZevcHWOQm71KA",
    authDomain: "litgame-b79a3.firebaseapp.com",
    databaseURL: "https://litgame-b79a3.firebaseio.com",
    projectId: "litgame-b79a3",
    storageBucket: "litgame-b79a3.appspot.com",
    messagingSenderId: "245679521016",
    appId: "1:245679521016:web:3ed53c9732891c4694cf0d",
    measurementId: "G-XDFQ4MXP6G"
  };
  fb:firebase.app.App
  fs:firebase.firestore.Firestore
  provider:firebase.auth.AuthProvider
  constructor() { 
    this.fb = firebase.initializeApp(this.firebaseConfig)
    this.provider = new firebase.auth.GoogleAuthProvider
    
  }
}
