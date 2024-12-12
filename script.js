document.addEventListener("DOMContentLoaded", () => {
   const newGameButton = document.getElementById("new-game");
   const playerHand = document.querySelector(".player-hand");
   const computerHand = document.querySelector(".computer-hand");
   const playerScoreElement = document.getElementById("player-score");
   const computerScoreElement = document.getElementById("computer-score");
   const trucoButton = document.getElementById("truco");

   let playerSetScore = 0;
   let computerSetScore = 0;
   let playerScore = 0;
   let computerScore = 0;
   let currentRound = 1; 
   let currentSetValue;

   let playerCards = [];
   let computerCards = [];

   let deck_id;

   newGameButton.addEventListener("click", startNewGame);
   trucoButton.addEventListener("click", truco);

   function startNewGame() {
      computerScore = 0;
      playerScore = 0;
      updateScoreboard();
      setDeckId();
      startNewSet();
   }

   function startNewSet() {
      currentSetValue = 1;
      resetHands();
      resetTable();

      distributeCards();
   }

   async function setDeckId() {
      try {
         const urlNewDeck =
            "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1&cards=AS,2S,3S,4S,5S,6S,7S,0S,JS,QS,KS,AD,2D,3D,4D,5D,6D,7D,0D,JD,QD,KD,AC,2C,3C,4C,5C,6C,7C,0C,JC,QC,KC,AH,2H,3H,4H,5H,6H,7H,0H,JH,QH,KH";
         if (localStorage.getItem("deck_id")) {
            deck_id = localStorage.getItem("deck_id");
         } else {
            const responseDeck = await fetch(urlNewDeck);
            const dataDeck = await responseDeck.json();
            deck_id = dataDeck.deck_id;
            localStorage.setItem("deck_id", deck_id);
            console.log(dataDeck);
         }
      } catch (error) {
         console.error(error);
      }
   }
   function updateScoreboard() {
      playerScoreElement.textContent = playerScore;
      computerScoreElement.textContent = computerScore;
   }

   function resetHands() {
      playerHand.innerHTML = "";
      computerHand.innerHTML = "";

      for (let i = 1; i <= 3; i++) {
         const playerCard = document.createElement("div");
         playerCard.classList.add("card");
         playerHand.appendChild(playerCard);

         const computerCard = document.createElement("div");
         computerCard.classList.add("card", "back");
         computerHand.appendChild(computerCard);
      }

      playerHand.querySelectorAll(".card").forEach((card) => {
         card.addEventListener("click", () => playCard(card));
      });
   }

   function resetTable() {
      document.querySelectorAll(".played-round .card").forEach((card) => {
         card.classList.add("placeholder");
         if (card.classList.contains("computer-card")) {
            card.textContent = "Computador";
            card.style.backgroundImage = "none";
            card.style.backgroundColor = "#424242";
         } else if (card.classList.contains("player-card")) {
            card.textContent = "Jogador";
            card.style.backgroundImage = "none";
            card.style.backgroundColor = "#424242";
         }
      });

      document
         .querySelectorAll(".computer-status, .player-status")
         .forEach((status) => {
            status.textContent = "";
            status.style.color = "";
         });

      currentRound = 1;
   }

   async function distributeCards() {
      try {
         const responseShuffle = await fetch(
            `https://deckofcardsapi.com/api/deck/${deck_id}/shuffle/`
         );
         const dataShuffle = await responseShuffle.json();

         const responseDraw = await fetch(
            `https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=6`
         );
         const dataDraw = await responseDraw.json();
         const cards = dataDraw.cards;
         playerCards = cards.slice(0, 3);
         computerCards = cards.slice(-3);
         let i = 0;
         playerHand.querySelectorAll(".card").forEach((card) => {
            card.textContent = playerCards[i].code;
            card.style.backgroundImage = `url(${playerCards[i].image})`;
            i++;
         });
      } catch (error) {
         console.error(error);
      }
   }

   function playCard(card) {
      if (currentRound > 3 || playerSetScore === 2 || computerSetScore === 2) {
         return;
      }

      const round = document.getElementById(`round-${currentRound}`);
      const playerCardSlot = round.querySelector(".player-card");

      if (!playerCardSlot.classList.contains("placeholder")) {
         alert("Esta rodada já está completa!");
         return;
      }

      playerCardSlot.textContent = card.textContent;
      playerCardSlot.style.backgroundImage = `url(${
         playerCards.filter(
            (cardPlayer) => cardPlayer.code == card.textContent
         )[0].image
      })`;
      playerCardSlot.classList.remove("placeholder");

      card.remove();

      let computerCard;
      computerCard = computerPlaysCard(currentRound);

      const playerStatus = round.querySelector(".player-status");
      const computerStatus = round.querySelector(".computer-status");

      const playerWins = determineRoundWinner(card.textContent, computerCard); 
      if (playerWins) {
         playerSetScore += 1;
         playerStatus.textContent = "ganhou";
         playerStatus.style.color = "#00ff04";
         computerStatus.style.color = "#ff0000";
         computerStatus.textContent = "perdeu";
      } else {
         computerStatus.textContent = "ganhou";
         computerStatus.style.color = "#00ff04";
         playerStatus.textContent = "perdeu";
         playerStatus.style.color = "#ff0000";
         computerSetScore += 1;
      }

      currentRound += 1;

      if (currentRound > 3 || playerSetScore === 2 || computerSetScore === 2) {
         endSet();
      }
   }

   function computerPlaysCard(currentRound) {
      const round = document.getElementById(`round-${currentRound}`);
      const computerCardHand = document.querySelector(".computer-hand .card");
      computerCardHand.remove();
      const computerCard = computerCards[currentRound - 1].code;
      const computerCardSlot = round.querySelector(".computer-card");
      computerCardSlot.textContent = computerCard;
      computerCardSlot.style.backgroundImage = `url(${
         computerCards.filter(
            (cardComputer) => cardComputer.code == computerCard
         )[0].image
      })`;
      computerCardSlot.classList.remove("placeholder");
      return computerCard;
   }

   function determineRoundWinner(playerCard, computerCard) {
      const cardValues = {
         AS: 14,
         "7S": 12,
         "3S": 10,
         "2S": 9,
         KS: 7,
         QS: 6,
         JS: 5,
         "0S": 4,
         "6S": 2,
         "5S": 1,
         "4S": 0,
         AD: 13,
         "3D": 10,
         "2D": 9,
         KD: 7,
         QD: 6,
         JD: 5,
         "0D": 4,
         "7D": 3,
         "6D": 2,
         "5D": 1,
         "4D": 0,
         "3C": 10,
         "2C": 9,
         AC: 8,
         KC: 7,
         QC: 6,
         JC: 5,
         "0C": 4,
         "7C": 3,
         "6C": 2,
         "5C": 1,
         "4C": 0,
         "7H": 11,
         "3H": 10,
         "2H": 9,
         AH: 8,
         KH: 7,
         QH: 6,
         JH: 5,
         "0H": 4,
         "6H": 2,
         "5H": 1,
         "4H": 0,
      };

      const playerValue = cardValues[playerCard];
      const computerValue = cardValues[computerCard];

      return playerValue > computerValue;
   }

   function truco() {
      alert("truco??");
      const numero = Math.floor(Math.random() * 2) + 1;
      if (numero == 1) {
         alert("aceito");
         currentSetValue++;
      } else {
         alert("corro");
         playerSetScore = 2;
         endSet();
      }
   }

   function endSet() {
      if (playerSetScore > computerSetScore) {
         playerScore += currentSetValue;
      } else if (playerSetScore < computerSetScore) {
         computerScore += currentSetValue;
      }
      setTimeout(() => {
         updateScoreboard();
         playerSetScore = 0;
         computerSetScore = 0;
         startNewSet();
      }, 1000);
   }

   startNewGame();
});
