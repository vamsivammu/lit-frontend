import { Component, OnInit } from '@angular/core';
import { SocketService } from '../socket.service';
import { Router } from '@angular/router';
import * as axios from 'axios'
import { FirebaseService } from '../firebase.service';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators'
declare var $;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  
  uid=''
  constructor(private socketService:SocketService,private router:Router,private firebase:FirebaseService) {
    // this.socketService.connect()
    this.firebase.fb.auth().onAuthStateChanged(user=>{
      if(user){
        console.log(user.uid)
        this.uid = user.uid
        this.socketService.socket.emit('sign_in',{uid:this.uid},(r)=>{

        })
      }else{
        console.log("logged out")
      }
    })

   }

  ngOnInit(): void {

    
  }
  signIn(){
    this.firebase.fb.auth().signInWithPopup(this.firebase.provider).then(res=>{
      this.socketService.uid =res.user.uid
      this.uid = this.socketService.uid
      this.socketService.socket.emit('sign_in',{uid:this.uid},(r)=>{

      })
    })
  }
  create_room(){
    var name = prompt('Your name','')
    console.log(this.socketService.socket)
    this.socketService.socket.emit('create_room',name,(r)=>{
      
      this.socketService.socket['room_id'] = r
      this.socketService.socket['name'] = name

      this.router.navigate(['game'])
      
    })

    this.socketService.socket.on('new_member_joined',r=>{
      console.log(r)
    })

  }
  join_room(){
      var room_id = prompt('Enter room id','0')
      var name = prompt('Your name','')
      this.socketService.socket.emit('join_room',{room_id:room_id,name:name},(r)=>{
        console.log(r)
        if(r=='joined'){
          // this.socketService.socket.on('new_member_joined',(r1)=>{
          //   console.log(r1.sockets)
      
          // })
          this.router.navigate(['game'])
          
        }
      })

  }


}
