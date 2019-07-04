import React, { Component } from 'react';
import './App.css';

const cardSequence = ["ACE", "2", "3", "4", "5", "6", "7", "8", "9", "10", "JACK", "QUEEN", "KING" ];
const trickCards = ["ACE", "2", "8", "JACK", "KING"];

class App extends Component {
  state = {
    isStart: false,
    isFirst: true,
    deck: null,
    remaining: 52,
    nextDraw: 1,
    activeDeck: [],
    referenceCard: null,
    currentPlayer: 1,
    currentHand: [],
    playerA: [],
    playerB: [],
    playerC: [],
    selectedCard: null
  }

  componentDidMount() {
    fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1").then(res => {
      return res.json()
    }).then(res => {
      this.setState({deck: res.deck_id})
    })
  }

  gameSetup() {
    fetch('https://deckofcardsapi.com/api/deck/' + this.state.deck + '/draw/?count=7').then(res => {
      return res.json()
    }).then(res => {
      this.setState({playerA: res.cards})
    })
    fetch('https://deckofcardsapi.com/api/deck/' + this.state.deck + '/draw/?count=7').then(res => {
      return res.json()
    }).then(res => {
      this.setState({playerB: res.cards})
    })
    fetch('https://deckofcardsapi.com/api/deck/' + this.state.deck + '/draw/?count=7').then(res => {
      return res.json()
    }).then(res => {
      this.setState({playerC: res.cards})
    }).then(res => {
      this.setState({currentHand: this.state.playerA})
    })
    fetch('https://deckofcardsapi.com/api/deck/' + this.state.deck + '/draw/?count=1').then(res => {
      return res.json()
    }).then(res => {
      this.setState({activeDeck: [...this.state.activeDeck, res.cards[0]], remaining: res.remaining})
    }).then(res => {
      this.setState({isStart: true})
    })
  }

  drawCard() {
    fetch('https://deckofcardsapi.com/api/deck/' + this.state.deck + '/draw/?count=' + this.state.nextDraw).then(res => {
      return res.json()
    }).then(res => {
      this.setState({currentHand: [...this.state.currentHand, res.cards[0]], remaining: res.remaining})
    }).then(res => {
      this.turnSwitch()
      this.setState({nextDraw: 1})
    })
    
  }

  turnSwitch() {
    this.cardTrickListener();
    this.turnHandler();
    this.setState({referenceCard: null})
  }

  turnHandler() {
    switch(this.state.currentPlayer) {
      case 1 :
        this.setState({currentPlayer: 2, playerA: this.state.currentHand, currentHand: this.state.playerB, isFirst: true})
      break;
      case 2 :
        this.setState({currentPlayer: 3, playerB: this.state.currentHand, currentHand: this.state.playerC, isFirst: true})
      break;
      case 3 :
        this.setState({currentPlayer: 1, playerC: this.state.currentHand, currentHand: this.state.playerA, isFirst: true})
      break;
      default:
        this.setState({currentPlayer: 1,  playerC: this.state.currentHand, currentHand: this.state.playerA, isFirst: true}) 
      break;
    }
  }

  cardPlacer() {
    if(this.cardValidator()) {
      this.setState({activeDeck: [...this.state.activeDeck, this.state.selectedCard]})
      this.cardRemover(this.state.currentHand)
      // this.state.isFirst ? this.setState({referenceCard: this.state.selectedCard}) : this.setState({referenceCard: this.state.referenceCard})
      this.setState({selectedCard: null})
      this.setState({isFirst: false})
    }
  }

  cardValidator() {
    let suit = this.state.activeDeck[(this.state.activeDeck.length - 1)].suit
    let value = this.state.activeDeck[(this.state.activeDeck.length - 1)].value

    if(this.state.isFirst) {
      if(suit === this.state.selectedCard.suit || value === this.state.selectedCard.value) {
        console.log("something here @ stage 0")
        this.setState({referenceCard: this.state.selectedCard})
        return true
      } else {
        alert("Invalid Move")
        return false
      }
    } else {
      let refValue = this.state.referenceCard.value
      let refSuit = this.state.referenceCard.suit
      let i = cardSequence.indexOf(refValue)
      if(refSuit === this.state.selectedCard.suit && (this.state.selectedCard.value === cardSequence[i + 1] || cardSequence[i - 1] )) {
        console.log("something here @ stage 1")
        return true
      }else if(refValue === this.state.selectedCard.value) {
        console.log("something here @ stage 2")
        return true
      } else {
        alert("Invalid Move")
        return false
      }
    }
  }

  cardSelector(e) {
    this.setState({selectedCard: e})
  }

  cardRender() {
    let a = this.state.activeDeck.reverse();
    let b = a[0].image;
    return b;
  }

  cardTrickListener() {
    switch(this.state.activeDeck[(this.state.activeDeck.length - 1)].value) {
      case "ACE":
          let a = prompt("What suit do you want to change to?")
          let arr = this.state.activeDeck;
          arr[(arr.length - 1)].suit = a;
          this.setState({activeDeck: arr})
        break;
      case "2":
          this.setState({nextDraw: 2})
        break;
      case "8":
          this.turnHandler();
        break;
      case "JACK":
          switch(this.state.activeDeck[(this.state.activeDeck.length - 1)].suit) {
            case "DIAMONDS" || "HEARTS":
                this.setState({nextDraw: 1})
              break;
            case "CLUBS" || "SPADES":
                this.setState({nextDraw: 5})
              break;
            default:
              break;
          }
        break;
      case "KING":
        break;
      default:
        console.log("fucked it and its defaultng  ER: " + this.state.activeDeck[(this.state.activeDeck.length - 1)].value)
        break;
    }
  }

  cardRemover(arr) {
    for(let i=0; i < arr.length; i++) {
      if(arr[i].code === this.state.selectedCard.code) {
        arr.splice(i, 1);
        return this.setState({currentHand: arr})
      }
    }
  }

  render() {
    return (
      <div className="App">
        <button onClick={() => this.gameSetup()}>START</button>
        <button onClick={() => this.drawCard()}>Pick Up</button>
        <button onClick={() => this.cardPlacer()}>Place</button>
        <button onClick={() => this.turnSwitch()}>End Turn</button>
        <hr></hr>
        <div>
         <img src={this.state.isStart ? this.state.activeDeck[(this.state.activeDeck.length - 1)].image : ""} onClick={() => this.cardPlacer()} alt=""/>
        </div>
        <hr></hr>
        <div>
          {this.state.currentHand.map(i => {
            return (
              <img src={i.image} alt={i.code} onClick={() => this.cardSelector(i)} key={i.code}/>
            )
          })}
        </div>
      </div>
    )
  }
}

export default App;
