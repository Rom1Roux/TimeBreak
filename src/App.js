import React, { Component } from "react";
import Output from "./Component/Output";
import Input from "./Component/Input";
import TimeBreak from "./Class/TimeBreak";
import Connecter from "./Component/Connecter";
import Login from "./Component/Login";
import "./App.css";
import Socket from "./Component/Socket";

//SOUNDS//
import Sound from 'react-sound';
import SoundAlert from 'react-sound';

import alertSoundLog from "./sounds/errorLogSound.mp3";
import alertSoundPseudo from "./sounds/errorPseudoSound.mp3";
import connectSound from "./sounds/connectSound.mp3";
import receiveMsgSound from "./sounds/receiveMsgSound.mp3";
import sendMsgSound from "./sounds/sendMsgSound.mp3";


import Disconnect from "./Component/Disconnect";
import User from "./Class/User";
import Footer from "./Component/Footer"
import "./Responsive.css"
import Swal from "sweetalert2";
const Tetris = require('react-tetris');




const INIT        = 0;
const VALIDMASTER = 1;
//const LOGIN       = 2; // Identifiant JSON pour Tableau Users (envoyer depuis Login)
const MESSAGE     = 3; // Identifiant JSON pour Tableau Messages (envoyer depuis INPUT) 
const UPDATELOGIN = 4;
const ERRORLOGIN = 5;



class App extends Component {
  constructor(props) {
    super(props);

    this.echange = new TimeBreak();

    this.state = { modif: false, message: "{}", user: "{}", etat: INIT, sound: true};
    this.address=window.location.href;
    this.address=this.address.substring(0,this.address.length-5)+"5000";

    this.playSound= Sound.status.STOPPED; // player sound
    this.soundProject=""; // url des sons

    this.playSoundAlert = SoundAlert.status.STOPPED; // player sound Alert Pseudo
    this.alertSoundUrl ="";

    this.btnSoundName = "SoundOn";


    Socket.initsocket(this.address);
}

componentDidMount() {

  // configuration réception message add
  Socket.configuresocket((err, data) => {
    
    let jsonReceive = JSON.parse(data);
    

    if (jsonReceive[0].type === VALIDMASTER && this.state.etat === INIT){
      this.echange.messages = [];
      console.log("historique des messages clients", jsonReceive[1].messages);
      jsonReceive[1].messages.map((msg) => this.setState({ message: msg, etat: VALIDMASTER}));
    }
    else if (jsonReceive[0].type === MESSAGE){
      this.soundMesgReceive(true); // joue le son à chaque message reçu
      this.setState({ message: jsonReceive[1]});
      //Local Storage
      localStorage.setItem('myHistoryMessage', JSON.stringify(this.echange.messages));
      console.log('local Storage client',localStorage.getItem('myHistoryMessage'));
    }
    
    // Reception de la Mise à jour des users 
    if(jsonReceive[0].type === UPDATELOGIN){
      this.echange.users = [];
      for (let i = 0; i < jsonReceive[1].user.length; i++) {
        let usr=new User();
        usr.create(jsonReceive[1].user[i].avatar,jsonReceive[1].user[i].pseudo);
        this.echange.users.push(usr);
      }
      this.cestok();
      this.soundNewLog(true);  // joue le son à chaque nouvelle personne connecté
    }
    if(jsonReceive[0].type === ERRORLOGIN){
      this.echange = new TimeBreak();
      this.echange.messages = [];
      this.echange.users = [];
      let usr=new User();
      usr.create("","");
      this.alertSound("AlertPseudo");
      Swal.fire({
        title: 'Erreur !',
        text: "Cet identifiant est déjà connecté",
        type: 'error',
        confirmButtonText: 'OK'
      });
      this.cestok();
    } 

  });
}

  cestok = () => {
    this.setState({ modif: !this.state.modif });
    console.log(this.state.modif);
    console.log(this.echange);
  
  };

  traitemessage=()=> {
    // si c'est un tableau
    if(this.state.message.length){
      if (this.echange.me.pseudo !== this.state.message[this.state.message.length -1].sender.pseudo){
        console.log(this.state.message[this.state.message.length -1]);
        this.echange.addMessage(this.state.message[this.state.message.length -1]);
      }
    
      else {
        this.soundMesgSend(true); // joue le son à chaque message envoyé
      }
      this.setState({message:"{}"});
    //si c'est un objet
    } else {
      if (this.echange.me.pseudo !== this.state.message.sender.pseudo){
        console.log(this.state.message);
        this.echange.addMessage(this.state.message);
      }
      else {
        this.soundMesgSend(true); // joue le son à chaque message envoyé
      }
      this.setState({message:"{}"});
    }

};

  traitePseudo=()=> {
    if (this.echange.me.pseudo !== this.state.user.pseudo){
      this.echange.addUser(this.state.user);
    }
    this.setState({user:"{}"});
  };

  initSound =()=>{
    this.soundProject = "";
  }

  soundMesgReceive =(data)=>{
    if (data){
      this.soundProject = receiveMsgSound;
      this.playSound = Sound.status.PLAYING; // joue le son à chaque message reçu
    }
  }

  soundMesgSend =(data)=>{
    if (data){
      this.soundProject = sendMsgSound;
      this.playSound = Sound.status.PLAYING; // joue le son à chaque message reçu
    }
  }

  soundNewLog =(data)=>{
    if (data){
      this.soundProject = connectSound;
      this.playSound = Sound.status.PLAYING; // joue le son à chaque message reçu
    }
  }

  alertSound=(data)=>{ // Fonction sonore utlisée par le composant Login
    if (data === "alertSaisie") {
      this.alertSoundUrl = alertSoundLog;
      this.playSoundAlert = SoundAlert.status.PLAYING;
    }
    if (data === "AlertPseudo"){
      this.alertSoundUrl = alertSoundPseudo;
      this.playSoundAlert = SoundAlert.status.PLAYING;
    }
    this.cestok();
  };

  switchSound =()=>{
     this.setState({ sound: !this.state.sound });
     this.btnSoundName = this.state.sound ? "SoundOff" : "SoundOn"; // checkbox On / Off
    }
  switchRules =()=>{
    Swal.fire({
      title: '',
      html:
      '<div style="background-color: #ffffff;border:3px ridge #6f2015;border-radius:25%;display:table-cell;"><img src="https://img.icons8.com/carbon-copy/48/000000/powerpoint.png"></img><div style="margin:10px;">Mettre le jeu en Pause</div></div></br>  ' +
      '<div style="background-color: #ffffff;border:3px ridge #6f2015;border-radius:25%;display:table-cell;"><img src="https://img.icons8.com/carbon-copy/48/000000/long-arrow-right.png"></img><div style="margin:10px;">Droite</div></div>' +
      '<div style="background-color: #ffffff;border:3px ridge #6f2015;border-radius:25%;display:table-cell;"><img src="https://img.icons8.com/carbon-copy/48/000000/left-squared.png"></img><div style="margin:10px;">Gauche</div></div></br> ' +
      '<div style="background-color: #ffffff;border:3px ridge #6f2015;border-radius:25%;display:table-cell;"><img src="https://img.icons8.com/carbon-copy/48/000000/up-squared.png"></img><div style="margin:10px;">Tourner les blocs</div></div></br> ' +
      '<div style="background-color: #ffffff;border:3px ridge #6f2015;border-radius:25%;display:table-cell;"><img src="https://img.icons8.com/wired/48/000000/c.png"></img><div style="margin:10px;">Changer de bloc(3*)</div></div></br> ' +
      '<div style="background-color: #ffffff;border:3px ridge #6f2015;border-radius:25%;display:table-cell;"><img src="https://img.icons8.com/dotty/48/000000/space-shuttle.png"></img><div style="margin:10px;">Descendre rapidement</div></div></br> ' +
      '<div style="background-color: #ffffff;border:3px ridge #6f2015;border-radius:25%;display:table-cell;"><img src="https://img.icons8.com/carbon-copy/48/000000/down-squared.png"></img><div style="margin:10px;">Descendre directement</div></div></br> ',
      width: 500,
      padding: '0em 10em 0em 10em',
      background: '#6f91b6',
      backdrop:   `rgba(0,0,123,0.4)`
    })
  }

  render() {
    if (this.state.message !== "{}")
      this.traitemessage();
    if (this.state.user !== "{}")
      this.traitePseudo();
    if (this.echange.me.pseudo ==="") {
      console.log("Client connecté");
      return (
      <div>
        <Login sound={this.alertSound} source={this.echange} callback={this.cestok}/>
        
         {/* SORTIE SON ALERT */}
        <SoundAlert
            url={this.alertSoundUrl}
            playStatus={this.playSoundAlert}
            playFromPosition={0}
        />
        <Footer/>
        
      </div>);
    }
    else {
      console.log("Client Loggué !");
    return (
      <div>
        <div className="navbar">
        {/* BOUTON DE DESACTIVATION SONORE POUR LE CHAT */}
        <div className="navitem" >
            <button className={this.btnSoundName} type="button" onClick={this.switchSound}></button>
        </div>
        <h1 className="navitem">Time-Break </h1>
        <Disconnect className="navitem"/> 
        </div>
        <div className="chat">
        <div className ="chatapp">
          <Connecter source={this.echange} callback={this.cestok}/>
        </div>
    
        <div className= "chatapp">

          <div>

            <Tetris>
              {({
                HeldPiece,
                Gameboard,
                PieceQueue,
                points,
                linesCleared
              }) => {
                // Render it however you'd like
                return (
                  <div>
                    {/* <HeldPiece /> */}
                    <div className="texteJeu">
                    <div className="titreJeu">
                    <h1>Tetris</h1>
                    </div>
                    <div>
                    <button className="help" type="button" onClick={this.switchRules}></button>
                    </div>
                    <div className="score">
                      <div>Points: {points}</div>
                      <div>Lines Cleared: {linesCleared}</div>
                    </div>
                    </div>
                    <div className="test">
                     <div className="item"><Gameboard /></div>
                     <div className="item"><PieceQueue /></div>
                    </div>
                  </div>
                )
              }}
            </Tetris>
          </div>
         
        </div>
        <div className= "chatapp">
          <Output source={this.echange}/>
          <Input source={this.echange} callback={this.cestok}/>
      
        </div>
        </div>
        <Footer/>
        <div>
          {/*SORTIE SON*/}
         {this.state.sound && // Rendu Conditionnel avec le state pour désactiver le son
            <Sound
              url={this.soundProject}
              playStatus={this.playSound}
              playFromPosition={0}
              />
         } {/*FIN DE SORTIE SON*/}
        </div>

      </div>
      );
    }
  }
}



export default App;
