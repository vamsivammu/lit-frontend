import { Component } from '@angular/core';
import { SocketService } from './socket.service';
// (window as any).global = window
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'lit-frontend';
  constructor(private socketService:SocketService){
    this.socketService.connect()
    
  }
}
