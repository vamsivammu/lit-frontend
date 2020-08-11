import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import {map,take} from 'rxjs/operators'
import { FirebaseService } from './firebase.service';
import { SocketService } from './socket.service';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private firebase:FirebaseService,private router:Router,private socketService:SocketService){

  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const observable = new Observable(obs=>{
        return this.firebase.fb.auth().onAuthStateChanged(user=>obs.next(user),err=>obs.next(err))
      })
      console.log('auth guard')
      return observable.pipe(map(user=>{
        if(user){
          console.log(user['uid'])
          this.socketService.socket.emit('sign_in',{uid:user['uid']},(r)=>{

          })
          return true
        }else{
          this.router.navigate([''])
          return false
        }
      }))

    }
  
}
