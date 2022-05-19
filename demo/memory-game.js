"use strict";

/** Memory game: find matching pairs of cards and flip both of them. */
const FOUND_MATCH_WAIT_MSECS = 1000;
const COLORS = [
  "crimson", "blue", "orange", "yellow",
  "green", "deeppink", "springgreen", "darkorchid",
  "aqua", "violet", "lemonchiffon", "dodgerblue",
  "lightcoral", "orangered", "lime", "sienna",
];

// Grab elements and variable counters
let turnCount = document.querySelector("#turn-count");
let pairsCount = document.querySelector("#pairs-count");
let scoreDiv = document.querySelector("#scores-div");
let form = document.querySelector("form");
let formDiv = document.querySelector("#form-div");
let usedColors = [];
let clickCounter = 0;
let clickedCardsArr = [];
let checkingBool = false;


// Create deck with 2 of each color, based on selected # of colors
form.addEventListener('submit', function(event) {
  let numColors = document.querySelector("#num-colors").value;
  if (numColors === "") {
    event.preventDefault();
    document.querySelector('label').style.color = "red";
  } else {
    event.preventDefault();
    chooseColors(numColors);
    const colors = shuffle(usedColors);
    pairsCount.innerHTML = numColors;
    createCards(colors);
    // Show scores and hide form
    scoreDiv.style.display = "flex";
    formDiv.style.display = 'none';
  }
})
// Restart button
document.querySelector("#restart-btn").addEventListener("click", () => {
  window.location.reload();
})

// Add colors from array based on # chosen
function chooseColors(num) {
  for (let i = 0; i < num; i++) {
    usedColors.push(COLORS[i]);
    usedColors.push(COLORS[i]);
  }
}

/** Shuffle array items in-place and return shuffled array. */
function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    // generate a random index between 0 and i
    let j = Math.floor(Math.random() * i);
    // swap item at i <-> item at j
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

// Create card for every color in colors (each will appear twice)
function createCards(colors) {
  const gameBoard = document.getElementById("game");

  for (let color of colors) {
    let card = document.createElement("div");
    card.classList.add(color);
    card.dataset.clicked = "false";
    card.dataset.matched = "false";
    card.addEventListener('click', handleCardClick)
    gameBoard.append(card);
  }
}

/** Flip a card face-up. */
function flipCard(card) {
  card.style.backgroundColor = card.className;
  card.dataset.clicked = "true";
}

/** Flip a card face-down. */
function unFlipCard(card1, card2) {
  card1.dataset.clicked = "false";
  card1.dataset.wrong = "false";
  card2.dataset.clicked = "false";
  card2.dataset.wrong = "false";
  card1.style.backgroundColor = "rgb(76, 148, 248)";
  card2.style.backgroundColor = "rgb(76, 148, 248)";
  checkingBool = false;
}

/** Handle clicking on a card: this could be first-card or second-card. */
function handleCardClick(evt) {
  if (checkingBool === false) {
    let clickedCard = evt.target;
    if (!(clickedCard === clickedCardsArr[0])) {
      clickedCardsArr.push(clickedCard);
      clickCounter++;
      flipCard(clickedCard);
      if (clickCounter === 2) {
        checkingBool = true;
        checkMatch(clickedCardsArr[0], clickedCardsArr[1]);
      }
    }
  }
}

/** Check for match between two cards */
function checkMatch(card1, card2) {
  turnCount.innerHTML++;
  if (card1.className === card2.className) {
    cardsMatch(card1, card2);
  } else {
    card1.dataset.wrong = "true";
    card2.dataset.wrong = "true";
    setTimeout(unFlipCard, FOUND_MATCH_WAIT_MSECS, card1, card2);
  }
  clickCounter = 0;
  clickedCardsArr = [];
}

// Set cards as matched, remove listeners, and check for win
function cardsMatch(card1, card2) {
  card1.dataset.matched = "true";
  card2.dataset.matched = "true";
  card1.removeEventListener("click", handleCardClick);
  card2.removeEventListener("click", handleCardClick);
  card1.style.boxShadow = "0 0 30px lime";
  card2.style.boxShadow = "0 0 30px lime";
  checkingBool = false;
  pairsCount.innerHTML--;
  checkWin();
}

// Display win if all pairs found
function checkWin() {
  if (pairsCount.innerHTML === '0') {
    let congrats = document.querySelector('#congrats');
    let finalScore = document.querySelector('#final-score');
    congrats.style.display = 'block';
    finalScore.innerHTML = turnCount.innerHTML;
    // Prep best score from local storage
    let bestScore = localStorage.getItem('bestScore');
    let bestScoreCount = document.querySelector("#best-score");
    if (bestScore === null) {
      localStorage.setItem('bestScore', 999);
      bestScore = localStorage.getItem('bestScore');
    }
    bestScoreCount.innerHTML = bestScore;
    // Update best score if needed
    if (parseInt(turnCount.innerHTML) < parseInt(bestScore)) {
      localStorage.setItem('bestScore', turnCount.innerHTML);
      bestScoreCount.innerHTML = turnCount.innerHTML;
    }
    // Display best score
    let bestScoreHdr = document.querySelector('#best-score-hdr');
    bestScoreHdr.style.display = "block";
  }
}