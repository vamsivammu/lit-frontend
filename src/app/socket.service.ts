import { Injectable } from '@angular/core';
import * as io from 'socket.io-client'
import { FirebaseService } from './firebase.service';
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  public socket:SocketIOClient.Socket
  uid = ''
  constructor(private firebase:FirebaseService) {
        this.firebase.fb.auth().onAuthStateChanged(user=>{
          if(user){
            this.uid = user.uid
          }
        })
   }
  connect(){
    var url = 'wss://litgame-backend.herokuapp.com'
    var url_test = 'http://localhost:5000'
    this.socket = io.connect(url,{transports:['websocket']})
    
  }

}
