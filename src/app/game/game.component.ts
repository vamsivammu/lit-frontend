import { Component, OnInit } from '@angular/core';
import { SocketService } from '../socket.service';
import * as axios from 'axios'
import { Router } from '@angular/router';
declare var $;

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  members = {}
  joining = false
  started = false
  current = ''
  teams={};
  my_team=''
  other_team=''
  player
  selected_id=''
  id=''
  room_id=''
  internal_exchange = false
  valid_deck_bools={
    diamond_low:false,
    diamond_high:false,
    spade_high:false,
    spade_low:false,
    heart_low:false,
    heart_high:false,
    club_high:false,
    club_low:false
  }
  scores={'a':0,'b':0}
  valid_seq = false
  game_over = false
  
  cards={}
  card_ids=[]
  symbols = []
  symbol_space = {}
  valid_cards={}
  card_nums = {}
  valid_decks =Object.keys(this.valid_deck_bools)
  deck={}
  keys =[]
  selected_card=''
  internal_team_exchange = false
  cards_loaded = false
  constructor(private socketService:SocketService,private router:Router) {
    this.members = []
    this.id = this.socketService.socket.id
    this.socketService.socket.emit('check_player',{uid:this.socketService.uid},(resp)=>{
        if(resp=='no_room'){
          this.router.navigateByUrl('')
        }
    })    
    
    this.socketService.socket.on('new_member_joined',(r)=>{
      this.id = this.socketService.socket.id
      this.members = r.sockets
      this.keys = Object.keys(this.members)
      console.log(this.members)
      console.log(this.socketService.socket.id)
      this.room_id = this.members[this.socketService.socket.id].room
      this.joining = true
      this.started = false
      // console.log(this.members)
    })
    this.socketService.socket.on('init_player',(r)=>{
      this.members = r.sockets
      this.current = r.current
      this.teams = r.teams
      this.player = r.info
      this.cards=this.player.cards
      this.card_nums = r.card_nums
      this.card_ids = Object.keys(this.cards)
      this.my_team = this.player.team
      this.other_team = this.my_team=='a'?'b':'a'
      this.joining = false
      this.started = true
      this.deck = r.deck
      this.load_valid_decks()
      this.cards_loaded = true
      this.socketService.socket.emit('update_socket',{team:this.my_team})
    })
    this.socketService.socket.on('card_req_notif',(data)=>{
      var cards_req = data.cards
      var to_socket = data.to
      var from_socket = data.from
      var resp = 'no'
      this.id = this.socketService.socket.id
      if(to_socket==this.id){
        if(this.cards[cards_req]){
          resp = 'yes'
        }
        $.toast({
          heading: 'Cards Requested',
          text: `${this.members[from_socket].name} is asking you ${cards_req}`,
          icon: 'info',
          loader: true,        // Change it to false to disable loader
          hideAfter:5000,
          allowToastClose:false,
          position:'top-right',
          loaderBg: '#9EC600',  // To change the background,
          afterHidden:()=>{
            this.socketService.socket.emit('card_response',{resp:resp,to_socket:from_socket,cards:cards_req,team:this.members[from_socket].team},(r)=>{
              if(r=='done'){

              }
            })
          }
      })
      }else{
        $.toast({
          heading: 'Cards Requested',
          text: `${this.members[from_socket].name} is asking ${this.members[to_socket].name} ${cards_req}`,
          icon: 'info',
          loader: true,        // Change it to false to disable loader
          hideAfter:5000,
          allowToastClose:false,
          position:'top-right',
          loaderBg: '#9EC600',  // To change the background,
      })
      }
    })
    this.socketService.socket.on('cards_exchanged',data=>{
      this.cards = data.cards
      this.card_ids = Object.keys(this.cards)
      this.load_valid_decks()
    })
    this.socketService.socket.on('deck_cancelled',data=>{
      this.scores = data.scores
      this.current = data.current
      $.toast(`${data.deck_cat} is cancelled`)
    })
    this.socketService.socket.on('cards_exchanged_notif',data=>{
      var from = data.from
      var to = data.to
      this.current = data.current
      if(data.exchanged){
        var cards = data.cards
        this.card_nums = data.card_nums
        $.toast({
          heading: 'Cards Exchanged',
          text: `${this.members[from].name} gave ${cards} to ${this.members[to].name}`,
          icon: 'info',
          loader: true,
          hideAfter:2000,
          allowToastClose:false,
          position:'top-right',
          stack:4,
          loaderBg: '#9EC600',
        })
        if(data.game_over[data.team] && data.team==this.other_team){
          this.internal_exchange = true
        }
      }else{
        var cards = data.cards
        $.toast({
          heading: 'Cards Exchanged',
          text: `${this.members[from].name} do not have ${cards} requested by:${this.members[to].name}`,
          icon: 'info',
          loader: true,        
          hideAfter:2000,
          allowToastClose:false,
          position:'top-right',
          stack:4,
          loaderBg: '#9EC600',
        })
      }

    })
    this.socketService.socket.on('deck_formed',data=>{
      var formed_by = data.formed_by
      this.scores = data.scores
      var suit = data.suit
      var cat = data.cat
      this.card_nums = data.card_nums
      this.current = data.current
      if(data.game_over[data.team] && data.team==this.other_team){
        this.internal_exchange = true
      }
      $.toast(`${this.members[formed_by].name} formed ${suit}_${cat} deck`)
      
    })
    this.socketService.socket.on('resume',r=>{
      this.id = this.socketService.socket.id
      this.player = r.info
      this.cards = this.player.cards
      this.card_ids = Object.keys(this.cards)
      this.my_team = this.player.team
      this.other_team = this.my_team=='a'?'b':'a'
      if(r.game_over[this.other_team]){
        this.internal_exchange = true
      }
      console.log(this.player)
    })
    this.socketService.socket.on('member_refreshed',(r)=>{
      this.members = r.sockets
      this.teams = r.teams
      this.scores = r.score
      this.current = r.current
      this.card_nums = r.card_nums
      this.joining = false
      this.started = true
      console.log(this.members)
    })
    this.socketService.socket.on('member_disconnected',(r)=>{
      this.members = r.sockets
    })
    this.socketService.socket.on('game_over',(r)=>{
      this.scores = r.scores
      this.game_over = true
      $.toast('game over')
    })
    this.form_deck()
    this.load_valid_decks()
    
  }

  toggle_card(suit,val){
    
    var e= document.getElementById(suit+'_'+val)
    if(e.classList.contains('selected')){
      e.classList.remove('selected')
      this.selected_card = ''
    }else{ 
      e = document.getElementById(this.selected_card)
      if(e){
        e.classList.remove('selected')
      }
      e = document.getElementById(suit+'_'+val)
      e.classList.add('selected')
      this.selected_card = suit+'_'+val
    }
  
  }
  object_keys(obj){
    return Object.keys(obj)
  }
  toggle_my_card(suit,val,weight){
    
    var e= document.getElementById(suit+'_'+val)
    if(e.classList.contains('selected')){
      e.classList.remove('selected')
      delete this.valid_cards[suit+'_'+val]
      this.check_valid_cards()
    }else{ 
      
      e.classList.add('selected')
      this.valid_cards[suit+'_'+val] = {suit:suit,value:val,weight:weight}
      this.check_valid_cards()
    }
  
  }
  check_valid_cards(){
    var cards = Object.keys(this.valid_cards)
    if(cards.length==6){
      this.valid_seq = true
      var suit = cards[0].split("_")[0]

      var weight = this.valid_cards[cards[0]].weight
      var cat = weight>7?'high':'low'
      for(var i=0;i<6;i++){
        var card = cards[i]
        if(this.valid_cards[card].suit!=suit){
          this.valid_seq = false
          break
        }
        if(cat=='high'){
          if(this.valid_cards[card].weight<7){
            this.valid_seq = false
            break
          }
        }else{
          if(this.valid_cards[card].weight>7){
            this.valid_seq = false
            break
          }
        }
      }

    }else{
      this.valid_seq = false
    }
  }
  form_seq(){
    this.check_valid_cards()
    if(this.valid_seq){

      this.socketService.socket.emit('form_deck',{cards:this.valid_cards,team:this.my_team},(r)=>{
        Object.keys(this.valid_cards).forEach(id=>{
          var e = document.getElementById(id)
          if(e){
            e.classList.remove('selected')
          }
        })
        if(r=='done'){
          this.valid_cards = {}
          this.valid_seq=false
        }else{
          $.toast('Invalid sequence')
        }
      })
    }else{
      $.toast('invalid sequence')
    }
  }
  reset_bools(){
    this.valid_deck_bools={
      diamond_low:false,
      diamond_high:false,
      spade_high:false,
      spade_low:false,
      heart_low:false,
      heart_high:false,
      club_high:false,
      club_low:false
    }
  
  }
  load_valid_decks(){
    this.reset_bools()
    this.valid_decks = []
    this.card_ids.forEach(card_id=>{
      var card = this.cards[card_id]
      console.log(card)
      if(card.value=='A' || card.value=='1' || card.value=='2' || card.value=='3' || card.value=='4' || card.value=='5' || card.value=='6'){
             eval(`this.valid_deck_bools['${card.suit}_low'] = true;`)
      }else{
        eval(`this.valid_deck_bools['${card.suit}_high'] = true;`)
      }
    })
    Object.keys(this.valid_deck_bools).forEach(key=>{
      if(this.valid_deck_bools[key]){
        this.valid_decks.push(key)
      }
    })
  }
  open_cards(id){
    if(this.current==this.id){
      if(this.card_nums[id]>0){
        this.selected_id = id
        $("#ask_cards").modal('show')
      }else{
        $.toast('this player has 0 cards')
      }

    }

  }
  
  askcard(){
    if(this.selected_card!=''){
      this.socketService.socket.emit('ask_card',{cards:this.selected_card,to_socket:this.selected_id},(r)=>{
        if(r=='requested'){
          $("#ask_cards").modal('hide')
          var e = document.getElementById(this.selected_card)
          if(e){
            e.classList.remove('selected')
          }
          this.selected_card = ''
          this.selected_id = ''
          

        }
      })
    }else{

    }
  }

  form_deck(){
    this.symbols = ['spade','club','heart','diamond']
    var weights = [13,12,11,1]
    this.valid_decks.forEach(v=>{
      this.symbol_space[v]=[]
    })
    var higher = ['K','Q','J','A']
    for(var i=2;i<=10;i++){
        for(var j = 0;j<4;j++){
            if(i!=7){
                this.deck[`${this.symbols[j]}_${i}`]={suit:this.symbols[j],value:`${i}`,weight:i}
                if(i<7){
                  this.symbol_space[`${this.symbols[j]}_low`].push({suit:this.symbols[j],value:`${i}`,weight:i,card_id:`${this.symbols[j]}_${i}`})
                }else{
                  this.symbol_space[`${this.symbols[j]}_high`].push({suit:this.symbols[j],value:`${i}`,weight:i,card_id:`${this.symbols[j]}_${i}`})
                }
            }
        }
    }
    for(var i=0;i<4;i++){
        for(var j=0;j<4;j++){
          if(higher[i]=='A'){
            this.symbol_space[`${this.symbols[j]}_low`].push({suit:this.symbols[j],value:`${higher[i]}`,weight:i,card_id:`${this.symbols[j]}_${higher[i]}`})
          }else{
            this.symbol_space[`${this.symbols[j]}_high`].push({suit:this.symbols[j],value:`${higher[i]}`,weight:i,card_id:`${this.symbols[j]}_${higher[i]}`})
          }
            this.deck[`${this.symbols[j]}_${higher[i]}`]={suit:this.symbols[j],value:higher[i],weight:weights[i]}
        }
    }
  }
  ngOnInit(): void {
    


  }



}
