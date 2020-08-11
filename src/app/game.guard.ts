import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators'
import { FirebaseService } from './firebase.service';
@Injectable({
  providedIn: 'root'
})
export class GameGuard implements CanActivate {
  constructor(private firebase:FirebaseService){

  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      
      return true;
    
  }
  
}
