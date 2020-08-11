import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GameComponent } from './game/game.component';
import { CardComponent } from './card/card.component';
import { AuthGuard } from './auth.guard';
import { UserComponent } from './user/user.component';


const routes: Routes = [
  {path:'',component:HomeComponent},
  {path:'game',component:GameComponent,canActivate:[AuthGuard]},
  {path:'**',redirectTo:''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
